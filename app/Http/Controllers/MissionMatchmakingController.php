<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use App\Models\User;
use App\Models\Chat;
use App\Services\TaskProcessingService;
use App\Services\MatchmakingService;
use App\Notifications\MissionInvitationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Services\MissionService;
use Inertia\Inertia;

class MissionMatchmakingController extends Controller
{
    protected $taskService;
    protected $matchmakingService;
    protected $missionService;

    public function __construct(TaskProcessingService $taskService, MatchmakingService $matchmakingService, MissionService $missionService)
    {
        $this->taskService = $taskService;
        $this->matchmakingService = $matchmakingService;
        $this->missionService = $missionService;
    }

    public function showMatchmaking(Mission $mission)
    {
        if (Auth::id() != $mission->user_id && !Auth::user()->isAdmin()) {
            abort(403);
        }

        $requirements = [];
        if (preg_match('/\[REQUIREMENTS\](.*?)\[\/REQUIREMENTS\]/s', $mission->additional_details, $matches)) {
            $requirements = json_decode($matches[1], true);
        } else {
            $requirements = $this->taskService->extractMissionRequirements($mission->title, $mission->description ?? '');
        }

        $helpers = $this->matchmakingService->findMatches($requirements, 10, [
            'lat' => $mission->lat,
            'lng' => $mission->lng,
            'radius' => 50
        ])->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'profile_photo' => $user->profile_photo_url,
                'rating' => $user->average_rating,
                'price' => $user->providerProfile?->hourly_rate ?? 0,
                'reviews_count' => $user->total_reviews,
                'verified' => $user->email_verified_at ? true : false,
                'match_score' => $user->match_score ?? 0,
                'matched_skills' => $user->matched_skills ?? []
            ];
        });

        return Inertia::render('Missions/Matchmaking', [
            'mission' => $mission,
            'providers' => $helpers,
        ]);
    }

    public function guestMatchmakingPreview()
    {
        if (!session()->has('pending_mission')) {
            return redirect()->route('missions.create');
        }

        $missionData = session('pending_mission');

        $requirements = [];
        if (preg_match('/\[REQUIREMENTS\](.*?)\[\/REQUIREMENTS\]/s', $missionData['additional_details'] ?? '', $matches)) {
            $requirements = json_decode($matches[1], true);
        } else {
            $requirements = $this->taskService->extractMissionRequirements($missionData['title'], $missionData['description'] ?? '');
        }

        $helpers = $this->matchmakingService->findMatches($requirements, 5, [
            'lat' => $missionData['lat'] ?? null,
            'lng' => $missionData['lng'] ?? null,
            'radius' => 50
        ])->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'profile_photo' => $user->profile_photo_url,
                'rating' => $user->average_rating,
                'price' => $user->providerProfile?->hourly_rate ?? 0,
                'reviews_count' => $user->total_reviews,
                'verified' => $user->email_verified_at ? true : false,
                'match_score' => $user->match_score ?? 0,
                'matched_skills' => $user->matched_skills ?? []
            ];
        });

        return Inertia::render('Missions/Matchmaking', [
            'mission' => $missionData,
            'providers' => $helpers,
            'isGuest' => true,
        ]);
    }

    public function handlePendingMission()
    {
        if (Auth::check() && session()->has('pending_mission')) {
            $data = session()->pull('pending_mission');
            $data['category'] = $data['category'] ?? 'Other';
            $user = Auth::user();

            if (empty($user->role_type)) {
                $user->role_type = 'client';
                $user->last_selected_role = 'client';
            }

            if (empty($user->location_lat) || empty($user->location_lng)) {
                if (!empty($data['lat']) && !empty($data['lng'])) {
                    $user->location_lat = $data['lat'];
                    $user->location_lng = $data['lng'];
                    $user->location_address = $data['location'] ?? $data['exact_address'] ?? null;
                    $user->discovery_radius_km = 30;
                }
            }

            $user->save();

            $mission = Mission::create(array_merge($data, [
                'user_id' => $user->id,
                'status' => Mission::STATUS_OUVERTE,
            ]));

            \App\Jobs\ProcessMissionEnrichment::dispatch($mission);

            return redirect()->route('missions.matchmaking', $mission->id)
                ->with('success', 'Mission created successfully! AI analysis is processing in the background.');
        }

        return redirect()->route('dashboard');
    }

    public function getNearbyProviders(Mission $mission)
    {
        if (Auth::id() !== $mission->user_id) {
            abort(403);
        }

        $requirements = [];
        if ($mission->additional_details && preg_match('/\[REQUIREMENTS\](.*?)\[\/REQUIREMENTS\]/s', $mission->additional_details, $matches)) {
            $requirements = json_decode($matches[1], true) ?? [];
        }

        $nearbyProviders = $this->matchmakingService->findMatches($requirements, 20, [
            'lat' => $mission->lat,
            'lng' => $mission->lng,
            'radius' => 50
        ]);

        $nearbyProviders = $nearbyProviders->filter(function ($user) use ($mission) {
            return $user->id !== $mission->user_id;
        })->map(function ($user) use ($mission) {
            if ($mission->lat && $mission->lng && $user->location_lat && $user->location_lng) {
                $user->distance_km = $this->calculateDistance($mission->lat, $mission->lng, $user->location_lat, $user->location_lng);
            } else {
                $user->distance_km = null;
            }

            $user->profile_photo_url = $user->profile_photo ? '/storage/' . $user->profile_photo : null;
            return $user;
        })->values();

        return response()->json(['nearby_providers' => $nearbyProviders]);
    }

    public function sendMissionToProvider(Mission $mission, User $provider)
    {
        if (Auth::id() !== $mission->user_id) {
            abort(403);
        }

        if ($provider->id === Auth::id()) {
            return back()->withErrors(['provider' => 'You cannot send a mission invitation to yourself.']);
        }

        if (!$provider->isProvider()) {
            return back()->withErrors(['provider' => 'This user is not a registered provider.']);
        }

        $provider->notify(new MissionInvitationNotification($mission, Auth::user()));

        $participantIds = [Auth::id(), $provider->id];
        sort($participantIds);

        $chat = Chat::firstOrCreate(['mission_id' => $mission->id], [
            'participant_ids' => $participantIds,
            'status' => 'active',
            'last_message_at' => now(),
        ]);

        if ($chat->wasRecentlyCreated) {
            $chat->messages()->create([
                'user_id' => null,
                'content' => Auth::user()->name . ' has invited you to this mission: ' . $mission->title,
                'is_system_message' => true,
            ]);
        }

        return back()->with('success', 'Mission sent to ' . $provider->name . ' successfully!');
    }

    public function contactProvider(Mission $mission, User $provider)
    {
        if (Auth::id() != $mission->user_id && !Auth::user()->isAdmin()) {
            abort(403);
        }

        if ($provider->id === Auth::id()) {
            return back()->withErrors(['provider' => 'You cannot contact yourself.']);
        }

        if (!$provider->isProvider()) {
            return back()->withErrors(['provider' => 'This user is not a registered provider.']);
        }

        $participantIds = [Auth::id(), $provider->id];
        sort($participantIds);

        $chat = Chat::firstOrCreate(['mission_id' => $mission->id], [
            'participant_ids' => $participantIds,
            'status' => 'active',
            'last_message_at' => now(),
        ]);

        if ($chat->wasRecentlyCreated) {
            $chat->messages()->create([
                'user_id' => null,
                'content' => 'Conversation started regarding mission: ' . $mission->title,
                'is_system_message' => true,
            ]);
        }

        return redirect()->route('messages', ['chat_id' => $chat->id]);
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return round($earthRadius * $c, 1);
    }
}
