<?php

use App\Http\Controllers\Api\V1\AuthController;
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
});

// Protected API routes
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::post('/auth/complete-profile', [AuthController::class, 'completeProfile']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});
