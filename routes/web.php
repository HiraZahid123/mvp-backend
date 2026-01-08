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
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
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

Route::middleware('guest')->group(function () {
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
    Route::get('/select-role', [RoleSelectionController::class, 'create'])->name('auth.select-role');
    Route::post('/select-role', [RoleSelectionController::class, 'store'])->name('auth.select-role.store');

    Route::get('/complete-profile', [ProfileCompletionController::class, 'create'])->name('auth.complete-profile');
    Route::post('/complete-profile', [ProfileCompletionController::class, 'store'])->name('auth.complete-profile.store');
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
