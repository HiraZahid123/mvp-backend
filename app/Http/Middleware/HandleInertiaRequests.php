<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Determine locale: session > browser > config
        $locale = session('locale', $request->getLanguages()[0] ?? app()->getLocale());

        // Normalize locale (e.g., 'en_NZ' -> 'en')
        $locale = substr($locale, 0, 2);

        // Validate against supported locales
        if (!in_array($locale, ['en', 'fr', 'de', 'it'])) {
            $locale = 'en';
        }

        app()->setLocale($locale);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'unread_notifications_count' => $request->user() ? $request->user()->unreadNotifications()->count() : 0,
            ],
            'locale' => $locale,
            'translations' => array_merge(
                json_decode(file_get_contents(base_path("lang/en.json")), true) ?: [],
                json_decode(file_get_contents(base_path("lang/{$locale}.json")), true) ?: []
            ),
            'flash' => [
                'requires_auth' => fn () => $request->session()->get('requires_auth'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'chat_id' => fn () => $request->session()->get('chat_id'),
                'stripe_client_secret' => fn () => $request->session()->get('stripe_client_secret'),
            ],
        ];
    }
}
