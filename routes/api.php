<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Auth\SocialAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public API routes
Route::prefix('v1')->group(function () {
    // Registration flow: register → send-otp → verify-otp → complete-profile
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/send-otp', [AuthController::class, 'sendOTP']);
    Route::post('/auth/verify-otp', [AuthController::class, 'verifyOTP']);

    // Login flow: login (auto-sends email OTP) → verify-otp
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Password Reset flow: forgot-password → verify-otp (standard) → reset-password
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

    // Social Authentication
    Route::post('/auth/social', [SocialAuthController::class, 'apiCallback']);

    // Stripe Webhook
    Route::post('/stripe/webhook', [\App\Http\Controllers\StripeWebhookController::class, 'handle']);
});

// Protected API routes
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::post('/auth/complete-profile', [AuthController::class, 'completeProfile']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Profile Management
    Route::get('/profile', [AuthController::class, 'user']); // Reuse auth/user for GET profile
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::patch('/profile/role', [ProfileController::class, 'updateRole']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);
});
