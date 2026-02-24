<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function index()
    {
        // 1. Fetch 6 most recent open missions
        $missions = Mission::where('status', Mission::STATUS_OUVERTE)
            ->latest()
            ->limit(6)
            ->get()
            ->map(function ($mission) {
                return [
                    'id' => $mission->id,
                    'title' => $mission->title,
                    'loc' => $mission->getApproximateLocation(),
                    'price' => $mission->budget,
                    'tag' => $mission->category ?? 'Other',
                    'desc' => $mission->description,
                ];
            });

        // 2. Fetch top 5 providers for mobile mockup
        $providers = User::where('role_type', 'provider')
            ->whereNotNull('email_verified_at')
            ->with(['providerProfile'])
            ->withCount('reviewsReceived')
            ->get()
            ->sortByDesc(function ($user) {
                return $user->average_rating;
            })
            ->take(5)
            ->values()
            ->map(function ($user) {
                return [
                    'name' => $user->name,
                    'price' => $user->providerProfile?->hourly_rate ?? 25,
                    'stars' => round($user->average_rating),
                    'dist' =>'Nearby', // Placeholder for distance logic if needed later
                ];
            });

        // 3. Fetch dynamic categories (future-proof)
        // We fetch categories that have active missions
        $activeCategories = Mission::where('status', Mission::STATUS_OUVERTE)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->toArray();

        // Default categories with icons and descriptions (fallback/base)
        $categoryConfig = [
            'Walking & Pets' => ['icon' => '🐕', 'desc' => 'Your dog needs to go out. You, not necessarily.'],
            'Assembly & Handyman' => ['icon' => '🔧', 'desc' => 'That flat-pack furniture that has been waiting too long.'],
            'Cleaning' => ['icon' => '🧹', 'desc' => 'Because walking into a clean space changes everything.'],
            'Gardening' => ['icon' => '🌿', 'desc' => 'Tall grass, leaves everywhere, a little refresh.'],
            'Daily Help' => ['icon' => '📦', 'desc' => 'Pick up a parcel, run an errand, dump run.'],
            'Administrative Help' => ['icon' => '📋', 'desc' => 'Taxes, official letters: a human who understands.'],
            'Remote Missions' => ['icon' => '🖥️', 'desc' => 'Translations, writing. Everything is done from home.'],
        ];

        $displayCategories = [];
        foreach ($activeCategories as $catName) {
            $displayCategories[] = [
                'name' => $catName,
                'icon' => $categoryConfig[$catName]['icon'] ?? '✦',
                'desc' => $categoryConfig[$catName]['desc'] ?? 'If it\'s legal and simplifies your life, post it.',
            ];
        }

        // Fill up to 8 categories if we have fewer active ones, using defaults
        if (count($displayCategories) < 8) {
            foreach ($categoryConfig as $name => $config) {
                if (!in_array($name, array_column($displayCategories, 'name'))) {
                    $displayCategories[] = [
                        'name' => $name,
                        'icon' => $config['icon'],
                        'desc' => $config['desc'],
                    ];
                }
                if (count($displayCategories) >= 7) break;
            }
        }

        // Add "Something else?" as the final static item
        $displayCategories[] = [
            'name' => 'Something else?',
            'icon' => '✦',
            'desc' => 'If it\'s legal and simplifies your life, post it.',
            'cta' => true
        ];

        return Inertia::render('Welcome', [
            'missions' => $missions,
            'providers' => $providers,
            'categories' => $displayCategories,
        ]);
    }
}
