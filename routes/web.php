<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminLoginController;
use App\Http\Controllers\Admin\SystemController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\LoginOTPVerificationController;
use App\Http\Controllers\Auth\MoodSelectionController;
use App\Http\Controllers\Auth\OTPVerificationController;
use App\Http\Controllers\Auth\ProfileCompletionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\RoleSelectionController;
use App\Http\Controllers\Auth\RoleSwitchController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\MissionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ProviderController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public & Utility Routes
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\HomeController;
/* ... */

Route::get('/', [HomeController::class, 'index'])->name('home');


// Public Profile Route
Route::get('/profile/{id}', [ProfileController::class, 'show'])->name('profile.show');

Route::post('/language-switch', function (Request $request) {
    $request->validate([
        'locale' => ['required', 'string', 'in:en,fr,de,it'],
    ]);
    session(['locale' => $request->locale]);
    app()->setLocale($request->locale);
    return back();
})->name('language.switch');

// Public Maintenance Route
Route::get('/system-clear', function () {
    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
    return response()->json([
        'status' => 'success',
        'message' => 'System optimization cache cleared successfully!',
        'output' => \Illuminate\Support\Facades\Artisan::output()
    ]);
});

/*
|--------------------------------------------------------------------------
| Guest Mission Routes (Publicly accessible)
|--------------------------------------------------------------------------
*/

Route::prefix('api')->name('api.')->group(function () {
    Route::post('/missions', [MissionController::class, 'store'])->name('missions.store');
    Route::post('/moderation/check', [MissionController::class, 'checkModeration'])->name('moderation.check');
    Route::post('/missions/ai-rewrite', [MissionController::class, 'aiRewrite'])->name('missions.ai-rewrite');
});

Route::get('/missions/create', [MissionController::class, 'create'])->name('missions.create');
Route::get('/missions/matchmaking-preview', [MissionController::class, 'guestMatchmakingPreview'])->name('missions.matchmaking-preview');

/*
|--------------------------------------------------------------------------
| Authentication & Onboarding
|--------------------------------------------------------------------------
*/

// Guest Only
Route::middleware('guest')->group(function () {
    // Manual Registration & Login
    Route::get('/register/manual', [RegisteredUserController::class, 'createManual'])->name('register.manual');
    Route::get('/login/manual', [AuthenticatedSessionController::class, 'createManual'])->name('login.manual');

    // Email Verification (for manual registration)
    Route::get('/verify-email-code', [EmailVerificationController::class, 'create'])->name('auth.verify-email-code');
    Route::post('/verify-email-code', [EmailVerificationController::class, 'verify'])->name('auth.verify-email-code.store');
    Route::post('/verify-email-code/resend', [EmailVerificationController::class, 'resend'])->name('auth.verify-email-code.resend');

    // OTP Verification (Legacy)
    Route::get('/verify-otp', [OTPVerificationController::class, 'create'])->name('auth.verify-otp');
    Route::post('/verify-otp/send', [OTPVerificationController::class, 'sendOTP'])->name('auth.verify-otp.send');
    Route::post('/verify-otp', [OTPVerificationController::class, 'store'])->name('auth.verify-otp.store')->middleware('throttle:6,1');

    /*
    // Login OTP Verification
    Route::get('/login/verify-otp', [LoginOTPVerificationController::class, 'create'])->name('login.verify-otp');
    Route::post('/login/verify-otp', [LoginOTPVerificationController::class, 'store'])->name('login.verify-otp.store');
    Route::post('/login/verify-otp/resend', [LoginOTPVerificationController::class, 'sendOTP'])->name('login.verify-otp.resend');
*/

    // Social Authentication
    Route::get('/auth/{provider}', [SocialAuthController::class, 'redirect'])->name('social.redirect');
    Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'callback'])->name('social.callback');
});

// Auth Required for Onboarding
Route::middleware('auth')->group(function () {
    // Role Selection
    Route::get('/select-role', [RoleSelectionController::class, 'create'])->name('auth.select-role');
    Route::post('/select-role', [RoleSelectionController::class, 'store'])->name('auth.select-role.store');

    // Profile Setup
    Route::get('/complete-identity', [ProfileCompletionController::class, 'createIdentity'])->name('auth.complete-identity');
    Route::post('/complete-identity', [ProfileCompletionController::class, 'storeIdentity'])->name('auth.complete-identity.store');
    Route::get('/complete-location', [ProfileCompletionController::class, 'createLocation'])->name('auth.complete-location');
    Route::post('/complete-location', [ProfileCompletionController::class, 'storeLocation'])->name('auth.complete-location.store');

    // Legacy Profile Setup
    Route::get('/complete-profile', [ProfileCompletionController::class, 'create'])->name('auth.complete-profile');
    Route::post('/complete-profile', [ProfileCompletionController::class, 'store'])->name('auth.complete-profile.store');

    // Finalization
    Route::get('/registration-success', function () {
        return Inertia::render('Auth/RegistrationSuccess', ['user' => Auth::user()]);
    })->name('auth.registration-success');

    Route::get('/mood-of-the-day', [MoodSelectionController::class, 'create'])->name('auth.mood-of-the-day');
    Route::post('/mood-of-the-day', [MoodSelectionController::class, 'store'])->name('auth.mood-of-the-day.store');

    // Provider Onboarding (AI Powered)
    Route::get('/onboarding', [OnboardingController::class, 'index'])->name('onboarding.index');
    Route::post('/onboarding/analyze', [OnboardingController::class, 'analyze'])->name('onboarding.analyze');
    Route::post('/onboarding/submit', [OnboardingController::class, 'store'])->name('onboarding.store');

    // Notifications
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])->name('mark-read');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllRead'])->name('mark-all-read');
    });

    // Role Switching
    Route::post('/role/switch', [RoleSwitchController::class, 'switch'])->name('role.switch');
});

/*
|--------------------------------------------------------------------------
| Authenticated User Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        $user = Auth::user();

        // Client data
        $missions = \App\Models\Mission::with(['user', 'offers'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        $stats = [
            'open' => $missions->whereIn('status', [\App\Models\Mission::STATUS_OUVERTE, \App\Models\Mission::STATUS_EN_NEGOCIATION])->count(),
            'active' => $missions->whereIn('status', [\App\Models\Mission::STATUS_VERROUILLEE, \App\Models\Mission::STATUS_EN_COURS, \App\Models\Mission::STATUS_EN_VALIDATION, \App\Models\Mission::STATUS_EN_LITIGE])->count(),
            'completed' => $missions->where('status', \App\Models\Mission::STATUS_TERMINEE)->count(),
            'balance' => $user->balance,
        ];

        // Provider data
        $providerMissions = \App\Models\Mission::with(['user', 'offers'])
            ->where('assigned_user_id', $user->id)
            ->latest()
            ->get();

        $providerOffers = \App\Models\MissionOffer::with(['mission'])
            ->where('user_id', $user->id)
            ->latest()
            ->take(10)
            ->get();

        $providerReviews = \App\Models\Review::with(['reviewer', 'mission'])
            ->where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        $providerStats = [
            'active' => $providerMissions->whereIn('status', [\App\Models\Mission::STATUS_VERROUILLEE, \App\Models\Mission::STATUS_EN_COURS, \App\Models\Mission::STATUS_EN_VALIDATION])->count(),
            'completed' => $providerMissions->where('status', \App\Models\Mission::STATUS_TERMINEE)->count(),
            'earnings' => $providerMissions->where('status', \App\Models\Mission::STATUS_TERMINEE)->sum('budget'),
            'offers_sent' => \App\Models\MissionOffer::where('user_id', $user->id)->count(),
            'avg_rating' => $user->rating_cache ?? 0,
            'reviews_count' => $user->reviews_count_cache ?? 0,
            'balance' => $user->balance ?? 0,
            'pending_withdrawal' => $user->pending_withdrawal ?? 0,
        ];

        return Inertia::render('Dashboard', [
            'missions' => $missions,
            'stats' => $stats,
            'providerMissions' => $providerMissions,
            'providerOffers' => $providerOffers,
            'providerReviews' => $providerReviews,
            'providerStats' => $providerStats,
        ]);
    })->name('dashboard');
    // Profile Management
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');

        // Notification Preferences
        Route::get('/notifications', [ProfileController::class, 'notificationPreferences'])->name('notifications');
        Route::patch('/notifications', [ProfileController::class, 'updateNotificationPreferences'])->name('notifications.update');
    });



    // Chat System (Internal API)
    Route::get('/messages', [\App\Http\Controllers\ChatController::class, 'messages'])->name('messages');
    Route::get('/chats', [\App\Http\Controllers\ChatController::class, 'index'])->name('api.chats.index');
    Route::get('/chats/{chat}', [\App\Http\Controllers\ChatController::class, 'show'])->name('api.chats.show');
    Route::get('/chats/{chat}/messages', [\App\Http\Controllers\ChatController::class, 'show'])->name('api.chats.messages');
    Route::post('/chats/{chat}/messages', [\App\Http\Controllers\ChatController::class, 'store'])->name('api.chats.messages.store');
    Route::post('/chats/{chat}/typing', [\App\Http\Controllers\ChatController::class, 'typing'])->name('api.chats.typing');
    Route::post('/chats/{chat}/accept', [\App\Http\Controllers\ChatController::class, 'accept'])->name('api.chats.accept');
    Route::post('/chats/{chat}/reject', [\App\Http\Controllers\ChatController::class, 'reject'])->name('api.chats.reject');
    Route::get('/missions/{mission}/chat', [\App\Http\Controllers\ChatController::class, 'getMissionChat'])->name('api.missions.chat');

    // Wallet Routes
    Route::get('/wallet', [\App\Http\Controllers\WalletController::class, 'index'])->name('wallet.index');
    Route::get('/wallet/client', [\App\Http\Controllers\WalletController::class, 'clientIndex'])->name('wallet.client');
    Route::post('/wallet/withdraw', [\App\Http\Controllers\WalletController::class, 'requestWithdrawal'])->name('wallet.withdraw');
    Route::delete('/wallet/withdraw/{withdrawal}', [\App\Http\Controllers\WalletController::class, 'cancelWithdrawal'])->name('wallet.cancel');

    // Provider Listing
    Route::get('/providers', [ProviderController::class, 'index'])->name('providers.index');
});


/*
|--------------------------------------------------------------------------
| Authenticated Mission Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {
    Route::prefix('missions')->name('missions.')->group(function () {
        Route::get('/pending', [MissionController::class, 'handlePendingMission'])->name('pending');
        Route::get('/active', [MissionController::class, 'active'])->name('active');
        Route::get('/search', [MissionController::class, 'search'])->name('search');
        Route::get('/{mission}', [MissionController::class, 'show'])->name('show');
        Route::get('/{mission}/edit', [MissionController::class, 'edit'])->name('edit');
        Route::patch('/{mission}', [MissionController::class, 'update'])->name('update');
        Route::post('/{mission}/update-status', [MissionController::class, 'updateStatus'])->name('update-status');
        Route::get('/{mission}/matchmaking', [MissionController::class, 'showMatchmaking'])->name('matchmaking');

        // Mission Actions
        Route::post('/{mission}/hire/{provider}', [MissionController::class, 'hire'])->name('hire');
        Route::post('/{mission}/offer', [MissionController::class, 'submitOffer'])->name('submit-offer');
        Route::post('/{mission}/question', [MissionController::class, 'askQuestion'])->name('ask-question');
        Route::post('/{mission}/accept', [MissionController::class, 'acceptFixedPrice'])->name('accept');
        Route::post('/{mission}/confirm-assignment', [MissionController::class, 'confirmAssignment'])->name('confirm-assignment');
        Route::post('/{mission}/offers/{offer}/select', [MissionController::class, 'selectOffer'])->name('select-offer');
        Route::post('/{mission}/questions/{question}/answer', [MissionController::class, 'answerQuestion'])->name('answer-question');
        Route::post('/{mission}/start', [MissionController::class, 'startWork'])->name('start-work');
        Route::post('/{mission}/submit-validation', [MissionController::class, 'submitForValidation'])->name('submit-validation');
        Route::post('/{mission}/validate', [MissionController::class, 'validateCompletion'])->name('validate');
        Route::post('/{mission}/dispute', [MissionController::class, 'initiateDispute'])->name('dispute');
        Route::post('/{mission}/cancel', [MissionController::class, 'cancel'])->name('cancel');
        Route::post('/{mission}/contact/{provider}', [MissionController::class, 'contactProvider'])->name('contact');
        Route::get('/{mission}/nearby-providers', [MissionController::class, 'getNearbyProviders'])->name('nearby-providers');
        Route::post('/{mission}/send-to-provider/{provider}', [MissionController::class, 'sendMissionToProvider'])->name('send-to-provider');
    });
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('/login', [AdminLoginController::class, 'create'])->name('login');
        Route::post('/login', [AdminLoginController::class, 'store'])->name('login.store');
    });

    Route::middleware('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard');

        // User Management
        Route::get('/users', [\App\Http\Controllers\Admin\AdminUserController::class, 'index'])->name('users.index');
        Route::get('/users/{user}', [\App\Http\Controllers\Admin\AdminUserController::class, 'show'])->name('users.show');
        Route::post('/users/{user}/suspend', [\App\Http\Controllers\Admin\AdminUserController::class, 'suspend'])->name('users.suspend');
        Route::post('/users/{user}/ban', [\App\Http\Controllers\Admin\AdminUserController::class, 'ban'])->name('users.ban');

        // Withdrawal Management
        Route::get('/withdrawals', [\App\Http\Controllers\Admin\AdminWithdrawalController::class, 'index'])->name('withdrawals.index');
        Route::post('/withdrawals/{withdrawal}/approve', [\App\Http\Controllers\Admin\AdminWithdrawalController::class, 'approve'])->name('withdrawals.approve');
        Route::post('/withdrawals/{withdrawal}/reject', [\App\Http\Controllers\Admin\AdminWithdrawalController::class, 'reject'])->name('withdrawals.reject');
        Route::post('/withdrawals/{withdrawal}/complete', [\App\Http\Controllers\Admin\AdminWithdrawalController::class, 'complete'])->name('withdrawals.complete');

        // Mission Oversight
        Route::get('/missions', [\App\Http\Controllers\Admin\AdminMissionController::class, 'index'])->name('missions.index');
        Route::get('/missions/{mission}', [\App\Http\Controllers\Admin\AdminMissionController::class, 'show'])->name('missions.show');
        Route::post('/missions/{mission}/resolve-dispute', [\App\Http\Controllers\Admin\AdminMissionController::class, 'resolveDispute'])->name('missions.resolve-dispute');

        // Chat Moderation
        Route::get('/chat/flagged', [\App\Http\Controllers\Admin\AdminChatController::class, 'flaggedMessages'])->name('chat.flagged');
        Route::get('/chat/strikes', [\App\Http\Controllers\Admin\AdminChatController::class, 'userStrikes'])->name('chat.strikes');
        Route::post('/chat/users/{user}/clear-strikes', [\App\Http\Controllers\Admin\AdminChatController::class, 'clearStrikes'])->name('chat.clear-strikes');

        // Payment Management
        Route::get('/payments', [\App\Http\Controllers\Admin\AdminPaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/{payment}', [\App\Http\Controllers\Admin\AdminPaymentController::class, 'show'])->name('payments.show');
        Route::post('/payments/{payment}/refund', [\App\Http\Controllers\Admin\AdminPaymentController::class, 'issueRefund'])->name('payments.refund');

        // Logout
        Route::post('/logout', [AdminLoginController::class, 'destroy'])->name('logout');

        // System Maintenance
        Route::prefix('system')->name('system.')->group(function () {
            Route::get('/optimize', [SystemController::class, 'optimizeClear'])->name('optimize');
            Route::get('/cache-clear', [SystemController::class, 'cacheClear'])->name('cache-clear');
            Route::get('/config-cache', [SystemController::class, 'configCache'])->name('config-cache');
            Route::get('/route-cache', [SystemController::class, 'routeCache'])->name('route-cache');
            Route::get('/view-clear', [SystemController::class, 'viewClear'])->name('view-clear');
            Route::get('/storage-link', [SystemController::class, 'storageLink'])->name('storage-link');
            Route::get('/migrate', [SystemController::class, 'migrate'])->name('migrate');
        });
    });
});

/*
|--------------------------------------------------------------------------
| Breeze Authentication Routes
|--------------------------------------------------------------------------
*/

require __DIR__ . '/auth.php';
