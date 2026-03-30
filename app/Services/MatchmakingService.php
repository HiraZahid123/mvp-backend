<?php

namespace App\Services;

use App\Models\User;
use App\Models\Skill;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MatchmakingService
{
    /**
     * Find best providers for a given mission based on extracted skills.
     */
    public function findMatches(array $missionRequirements, int $limit = 10, ?array $location = null): Collection
    {
        $requiredSkills = collect($missionRequirements['required_skills'] ?? []);
        $category = $missionRequirements['category'] ?? null;
        
        // 1. Get List of Skill Names (Normalized)
        $skillNames = $requiredSkills->pluck('name')->map(fn($name) => strtolower($name))->toArray();

        // 2. Build Base Query
        $creator = Auth::user();
        $lat = $location['lat'] ?? ($creator?->location_lat) ?? null;
        $lng = $location['lng'] ?? ($creator?->location_lng) ?? null;
        $initialRadius = $location['radius'] ?? ($creator?->discovery_radius_km) ?? 20;

        // Level A/B: Try local search (20km - 100km)
        $candidates = $this->queryCandidates($skillNames, $category, $lat, $lng, $initialRadius, $limit);

        // If no local matches, try broadening the search to any location (Global)
        if ($candidates->isEmpty()) {
            $candidates = $this->queryCandidates($skillNames, $category, null, null, null, $limit);
        }

        // 3. Score Candidates
        $scoredCandidates = $candidates->map(function ($user) use ($requiredSkills, $category) {
            $score = 0;
            $matches = [];

            // Similarity Scoring
            foreach ($requiredSkills as $reqSkill) {
                $userSkill = $user->skills->first(function($s) use ($reqSkill) {
                    return strtolower($s->name) === strtolower($reqSkill['name']);
                });

                if ($userSkill) {
                    // Base match score
                    $points = ($reqSkill['importance'] === 'must_have') ? 20 : 10;
                    
                    // Proficiency bonus
                    $prof = $userSkill->pivot->proficiency_level;
                    if ($prof === 'expert') $points += 10;
                    if ($prof === 'intermediate') $points += 5;

                    $score += $points;
                    $matches[] = $userSkill->name;
                }
            }

            // Experience Bonus
            if ($user->providerProfile) {
                $score += min($user->providerProfile->years_experience, 20);
                
                // Category Bonus
                if ($category && $user->providerProfile->main_category === $category) {
                    $score += 15;
                }
            }

            // Verified Bonus
            if ($user->hasVerifiedPhone()) {
                $score += 5;
            }

            $user->match_score = $score;
            $user->matched_skills = $matches;
            
            return $user;
        });

        // 4. Sort and Return
        return $scoredCandidates->sortByDesc('match_score')->take($limit)->values();
    }

    /**
     * Helper to query candidates with specific parameters.
     */
    protected function queryCandidates(array $skillNames, ?string $category, ?float $lat, ?float $lng, ?int $radius, int $limit): Collection
    {
        $query = User::where('role_type', '!=', 'client')
            ->where('is_admin', false)
            ->with(['skills', 'providerProfile']);

        // Location Filter
        if ($lat && $lng && $radius) {
            $latRange = $radius / 111;
            $lngRange = $radius / (111 * cos(deg2rad($lat))); 

            $query->whereBetween('location_lat', [$lat - $latRange, $lat + $latRange])
                  ->whereBetween('location_lng', [$lng - $lngRange, $lng + $lngRange]);
        }

        // Skill or Category Filter
        $query->where(function($q) use ($skillNames, $category) {
            if (!empty($skillNames)) {
                $q->whereHas('skills', function($sq) use ($skillNames) {
                    $sq->whereIn(DB::raw('LOWER(name)'), $skillNames);
                });
            }
            
            if ($category) {
                $q->orWhereHas('providerProfile', function($pq) use ($category) {
                    $pq->where('main_category', $category);
                });
            }
        });

        $results = $query->where('id', '!=', Auth::id())->take($limit)->get();

        // Final Fallback: If absolutely no filtered results, return any top performers (Global Fallback)
        if ($results->isEmpty()) {
            return User::where('role_type', '!=', 'client')
                ->where('is_admin', false)
                ->where('id', '!=', Auth::id())
                ->with(['skills', 'providerProfile'])
                ->orderBy('rating_cache', 'desc')
                ->take($limit)
                ->get();
        }

        return $results;

    }

}
