<?php

namespace App\Observers;

use App\Models\Review;
use App\Models\User;

class ReviewObserver
{
    /**
     * Handle the Review "created" event.
     */
    public function created(Review $review): void
    {
        $this->updateUserCache($review->user);
    }

    /**
     * Handle the Review "updated" event.
     */
    public function updated(Review $review): void
    {
        $this->updateUserCache($review->user);
    }

    /**
     * Handle the Review "deleted" event.
     */
    public function deleted(Review $review): void
    {
        $this->updateUserCache($review->user);
    }

    /**
     * Update the user's rating and reviews count cache.
     */
    protected function updateUserCache(User $user): void
    {
        $stats = Review::where('user_id', $user->id)
            ->selectRaw('AVG(rating) as average_rating, COUNT(*) as reviews_count')
            ->first();

        $user->update([
            'rating_cache' => round($stats->average_rating ?? 0, 2),
            'reviews_count_cache' => $stats->reviews_count ?? 0,
        ]);
    }
}
