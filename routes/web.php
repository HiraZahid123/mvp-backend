<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
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

// Custom Auth Routes
use App\Http\Controllers\Auth\RoleSelectionController;
use App\Http\Controllers\Auth\OTPVerificationController;
use App\Http\Controllers\Auth\ProfileCompletionController;
use App\Http\Controllers\Auth\LoginOTPVerificationController;

Route::middleware('guest')->group(function () {
    Route::get('/select-role', [RoleSelectionController::class, 'create'])->name('auth.select-role');
    Route::post('/select-role', [RoleSelectionController::class, 'store'])->name('auth.select-role.store');

    Route::get('/verify-otp', [OTPVerificationController::class, 'create'])->name('auth.verify-otp');
    Route::post('/verify-otp/send', [OTPVerificationController::class, 'sendOTP'])->name('auth.verify-otp.send');
    Route::post('/verify-otp', [OTPVerificationController::class, 'store'])->name('auth.verify-otp.store')->middleware('rate-limit-otp');

    Route::get('/verify-login-otp', [LoginOTPVerificationController::class, 'create'])->name('auth.verify-login-otp');
    Route::post('/verify-login-otp/send', [LoginOTPVerificationController::class, 'sendOTP'])->name('auth.verify-login-otp.send');
    Route::post('/verify-login-otp', [LoginOTPVerificationController::class, 'store'])->name('auth.verify-login-otp.store')->middleware('rate-limit-otp');
});

Route::middleware('auth')->group(function () {
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
