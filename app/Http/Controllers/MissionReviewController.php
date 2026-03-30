<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MissionReviewController extends Controller
{
    public function submitReview(Request $request, Mission $mission)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $userId = Auth::id();
        $isHost = $userId == $mission->user_id;
        $isProvider = $userId == $mission->assigned_user_id;

        if (!$isHost && !$isProvider) {
            abort(403);
        }

        if ($mission->status !== Mission::STATUS_TERMINEE) {
            return back()->withErrors(['mission' => 'Reviews can only be submitted for finished missions.']);
        }

        $targetUserId = $isHost ? $mission->assigned_user_id : $mission->user_id;

        if (!$targetUserId) {
            return back()->withErrors(['mission' => 'Target user not found.']);
        }

        Review::updateOrCreate(
            [
                'mission_id' => $mission->id,
                'reviewer_id' => $userId,
            ],
            [
                'user_id' => $targetUserId,
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]
        );

        return back()->with('success', 'Review submitted successfully!');
    }
}
