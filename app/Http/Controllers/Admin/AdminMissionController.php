<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\AdminActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Mission::with(['user', 'assignedUser']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $missions = $query->paginate(20);
        
        return \Inertia\Inertia::render('Admin/Missions/Index', [
            'missions' => $missions,
            'filters' => [
                'status' => $request->status,
            ],
        ]);
    }

    public function show(Mission $mission)
    {
        $mission->load(['user', 'assignedUser', 'offers', 'questions', 'reviews']);
        
        return \Inertia\Inertia::render('Admin/Missions/Show', [
            'mission' => $mission,
        ]);
    }

    public function resolveDispute(Request $request, Mission $mission)
    {
        $request->validate([
            'resolution' => 'required|in:complete,refund',
            'reason' => 'required|string',
        ]);

        if ($mission->status !== Mission::STATUS_EN_LITIGE) {
            return response()->json(['error' => 'Mission is not in dispute'], 422);
        }

        if ($request->resolution === 'complete') {
            $mission->transitionTo(Mission::STATUS_TERMINEE);
            app(\App\Services\StripeService::class)->releaseFunds($mission);
        } else {
            $mission->transitionTo(Mission::STATUS_ANNULEE);
            app(\App\Services\StripeService::class)->refund($mission);
        }

        AdminActivityLog::create([
            'admin_id' => Auth::id(),
            'action' => 'dispute_resolved',
            'subject_type' => Mission::class,
            'subject_id' => $mission->id,
            'metadata' => ['resolution' => $request->resolution, 'reason' => $request->reason],
        ]);

        return response()->json(['message' => 'Dispute resolved as ' . $request->resolution]);
    }
}
