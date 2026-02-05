<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminMissionController extends Controller
{
    /**
     * Display all missions
     */
    public function index(Request $request)
    {
        $statusFilter = $request->get('status', 'all');

        $missions = Mission::with(['user:id,name,email', 'assignedUser:id,name,email'])
            ->when($statusFilter !== 'all', function($query) use ($statusFilter) {
                $query->where('status', $statusFilter);
            })
            ->orderByDesc('created_at')
            ->paginate(20);

        $stats = [
            'total' => Mission::count(),
            'open' => Mission::where('status', Mission::STATUS_OUVERTE)->count(),
            'inProgress' => Mission::where('status', Mission::STATUS_EN_COURS)->count(),
            'completed' => Mission::where('status', Mission::STATUS_TERMINEE)->count(),
        ];

        return Inertia::render('Admin/AdminMissions', [
            'missions' => $missions,
            'stats' => $stats,
            'currentStatus' => $statusFilter,
        ]);
    }
}
