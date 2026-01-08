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
        if (!in_array($locale, ['en', 'fr'])) {
            $locale = 'en';
        }

        app()->setLocale($locale);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'locale' => $locale,
            'translations' => array_merge(
                json_decode(file_get_contents(base_path("lang/en.json")), true) ?: [],
                json_decode(file_get_contents(base_path("lang/{$locale}.json")), true) ?: []
            ),
        ];
    }
}
