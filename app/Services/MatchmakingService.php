<?php

namespace App\Services;

use App\Models\User;
use App\Models\Skill;
use Illuminate\Support\Collection;
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
        
        if ($requiredSkills->isEmpty()) {
            // Fallback: Return verified experts in the category or random top rated
            return User::where('role_type', '!=', 'customer')
                ->inRandomOrder()
                ->take($limit)
                ->get();
        }

        // 1. Get List of Skill Names
        $skillNames = $requiredSkills->pluck('name')->map(function($name) {
            return strtolower($name);
        })->toArray();

        // 2. Find Users who have these skills AND are within range
        // We use a simple bounding box for the first pass (very fast with indexes)
        $creator = auth()->user();
        $query = User::where('role_type', '!=', 'customer');

        // Priority: Passed location > Creator's profile location
        $lat = $location['lat'] ?? ($creator?->location_lat) ?? null;
        $lng = $location['lng'] ?? ($creator?->location_lng) ?? null;

        if ($lat && $lng) {
            $radius = $location['radius'] ?? ($creator?->discovery_radius_km) ?? 20;
            // Rough approximation: 1 degree latitude = 111km
            $latRange = $radius / 111;
            // Rough approximation for longitude at Swiss latitudes (~46N): 1 deg = ~77km
            $lngRange = $radius / 77; 

            $query->whereBetween('location_lat', [
                $lat - $latRange,
                $lat + $latRange
            ])->whereBetween('location_lng', [
                $lng - $lngRange,
                $lng + $lngRange
            ]);
        }
        
        $candidates = $query->whereHas('skills', function($query) use ($skillNames) {
            $query->whereIn('name', $skillNames);
        })->with(['skills', 'providerProfile'])->get();

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

            // Experience Bonus (1 point per year)
            if ($user->providerProfile) {
                $score += min($user->providerProfile->years_experience, 20); // Cap at 20 pts
                
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
}
