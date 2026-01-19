<?php

use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::get('/dashboard', function () {
    $tasks = \App\Models\Task::with('attachments')
        ->where('user_id', auth()->id())
        ->latest() // Default sort
        ->get();
        // ->sortBy('created_at'); // We can sort in frontend or here. Frontend expects old to new for chat, usually.
        // Let's pass latest and sort in JS as implemented in ChatInterface.

    return Inertia::render('Dashboard', [
        'tasks' => $tasks
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// Public Mission Routes (Must come before {mission} wildcard)
Route::post('/api/missions', [\App\Http\Controllers\MissionController::class, 'store'])->name('missions.store');
Route::get('/missions/create', [\App\Http\Controllers\MissionController::class, 'create'])->name('missions.create');
Route::get('/missions/matchmaking-preview', [\App\Http\Controllers\MissionController::class, 'guestMatchmakingPreview'])->name('missions.matchmaking-preview');
Route::post('/api/moderation/check', [\App\Http\Controllers\MissionController::class, 'checkModeration'])->name('moderation.check');
Route::post('/api/missions/ai-rewrite', [\App\Http\Controllers\MissionController::class, 'aiRewrite'])->name('missions.ai-rewrite');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Mission Routes
    Route::get('/api/tasks', [\App\Http\Controllers\TaskController::class, 'index'])->name('tasks.index');
    Route::post('/api/tasks', [\App\Http\Controllers\TaskController::class, 'store'])->name('tasks.store');

    Route::get('/missions/pending', [\App\Http\Controllers\MissionController::class, 'handlePendingMission'])->name('missions.pending');
    Route::get('/missions/active', [\App\Http\Controllers\MissionController::class, 'active'])->name('missions.active');
    Route::get('/missions/search', [\App\Http\Controllers\MissionController::class, 'search'])->name('missions.search');
    Route::get('/missions/{mission}', [\App\Http\Controllers\MissionController::class, 'show'])->name('missions.show');
    Route::post('/missions/{mission}/offer', [\App\Http\Controllers\MissionController::class, 'submitOffer'])->name('missions.submit-offer');
    Route::post('/missions/{mission}/question', [\App\Http\Controllers\MissionController::class, 'askQuestion'])->name('missions.ask-question');
    Route::post('/missions/{mission}/accept', [\App\Http\Controllers\MissionController::class, 'acceptFixedPrice'])->name('missions.accept');
    Route::post('/missions/{mission}/offers/{offer}/select', [\App\Http\Controllers\MissionController::class, 'selectOffer'])->name('missions.select-offer');
    Route::post('/missions/{mission}/questions/{question}/answer', [\App\Http\Controllers\MissionController::class, 'answerQuestion'])->name('missions.answer-question');
    Route::get('/missions/{mission}/matchmaking', [\App\Http\Controllers\MissionController::class, 'showMatchmaking'])->name('missions.matchmaking');
    Route::post('/missions/{mission}/contact/{helper}', [\App\Http\Controllers\MissionController::class, 'contactHelper'])->name('missions.contact');
});


Route::post('/language-switch', function (Request $request) {
    $request->validate([
        'locale' => ['required', 'string', 'in:en,fr'],
    ]);

    session(['locale' => $request->locale]);
    app()->setLocale($request->locale);

    return back();
})->name('language.switch');

// Custom Auth Routes
use App\Http\Controllers\Auth\RoleSelectionController;
use App\Http\Controllers\Auth\OTPVerificationController;
use App\Http\Controllers\Auth\ProfileCompletionController;
use App\Http\Controllers\Auth\LoginOTPVerificationController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\MoodSelectionController;

Route::middleware('guest')->group(function () {
    // Email Verification Routes (for manual registration)
    Route::get('/verify-email-code', [EmailVerificationController::class, 'create'])->name('auth.verify-email-code');
    Route::post('/verify-email-code', [EmailVerificationController::class, 'verify'])->name('auth.verify-email-code.store');
    Route::post('/verify-email-code/resend', [EmailVerificationController::class, 'resend'])->name('auth.verify-email-code.resend');

    // Manual Registration Routes
    Route::get('/register/manual', [App\Http\Controllers\Auth\RegisteredUserController::class, 'createManual'])->name('register.manual');
    
    // Manual Login Routes
    Route::get('/login/manual', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'createManual'])->name('login.manual');
    
    // OTP Verification (legacy - keeping for backward compatibility)
    Route::get('/verify-otp', [OTPVerificationController::class, 'create'])->name('auth.verify-otp');
    Route::post('/verify-otp/send', [OTPVerificationController::class, 'sendOTP'])->name('auth.verify-otp.send');
    Route::post('/verify-otp', [OTPVerificationController::class, 'store'])->name('auth.verify-otp.store')->middleware('throttle:6,1');

    // Social Authentication Routes
    Route::get('/auth/{provider}', [SocialAuthController::class, 'redirect'])->name('social.redirect');
    Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'callback'])->name('social.callback');

    // SMS Testing Route (development only)
    if (app()->environment('local')) {
        Route::get('/test-sms', function () {
            return view('test-sms');
        })->name('test.sms');
        Route::post('/test-sms', function (Request $request) {
            $phone = $request->input('phone');
            $otp = \App\Services\OTPService::generateOTP();

            try {
                $otpService = app(\App\Services\OTPService::class);
                $reflection = new \ReflectionClass($otpService);
                $method = $reflection->getMethod('sendSMSOTP');
                $method->setAccessible(true);
                $method->invoke($otpService, $phone, $otp);

                return back()->with('success', "Test SMS sent! OTP: {$otp}");
            } catch (\Exception $e) {
                return back()->with('error', 'SMS failed: ' . $e->getMessage());
            }
        })->name('test.sms.send');
    }
});

Route::middleware('auth')->group(function () {
    // Role Selection
    Route::get('/select-role', [RoleSelectionController::class, 'create'])->name('auth.select-role');
    Route::post('/select-role', [RoleSelectionController::class, 'store'])->name('auth.select-role.store');

    // Identity & Profile Setup (Split into two steps)
    Route::get('/complete-identity', [ProfileCompletionController::class, 'createIdentity'])->name('auth.complete-identity');
    Route::post('/complete-identity', [ProfileCompletionController::class, 'storeIdentity'])->name('auth.complete-identity.store');
    
    Route::get('/complete-location', [ProfileCompletionController::class, 'createLocation'])->name('auth.complete-location');
    Route::post('/complete-location', [ProfileCompletionController::class, 'storeLocation'])->name('auth.complete-location.store');

    // Legacy Complete Profile (backward compatibility)
    Route::get('/complete-profile', [ProfileCompletionController::class, 'create'])->name('auth.complete-profile');
    Route::post('/complete-profile', [ProfileCompletionController::class, 'store'])->name('auth.complete-profile.store');

    // Registration Success Screen
    Route::get('/registration-success', function () {
        return Inertia::render('Auth/RegistrationSuccess', [
            'user' => Auth::user(),
        ]);
    })->name('auth.registration-success');

    // Mood of the Day (appears after every login)
    Route::get('/mood-of-the-day', [MoodSelectionController::class, 'create'])->name('auth.mood-of-the-day');
    Route::post('/mood-of-the-day', [MoodSelectionController::class, 'store'])->name('auth.mood-of-the-day.store');

    // Provider Onboarding (AI Powered)
    Route::get('/onboarding', [\App\Http\Controllers\OnboardingController::class, 'index'])->name('onboarding.index');
    Route::post('/onboarding/analyze', [\App\Http\Controllers\OnboardingController::class, 'analyze'])->name('onboarding.analyze');
    Route::post('/onboarding/submit', [\App\Http\Controllers\OnboardingController::class, 'store'])->name('onboarding.store');
});

require __DIR__.'/auth.php';

// Admin Routes
use App\Http\Controllers\Admin\AdminLoginController;
use App\Http\Controllers\Admin\AdminDashboardController;

Route::middleware('guest')->group(function () {
    Route::get('/admin/login', [AdminLoginController::class, 'create'])->name('admin.login');
    Route::post('/admin/login', [AdminLoginController::class, 'store'])->name('admin.login.store');
});

Route::middleware('admin')->group(function () {
    Route::get('/admin/dashboard', AdminDashboardController::class)->name('admin.dashboard');
    Route::post('/admin/logout', [AdminLoginController::class, 'destroy'])->name('admin.logout');
});

// Optimization & Cache Clearing Route
Route::get('/optimize-system', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('optimize:clear');
        return "System Optimization & Cache Clearing Successful!<br><br><pre>" . \Illuminate\Support\Facades\Artisan::output() . "</pre>";
    } catch (\Exception $e) {
        return "Error occurred while clearing cache: " . $e->getMessage();
    }
})->name('system.optimize');
