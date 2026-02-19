<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PanneController;
use App\Http\Controllers\Api\CarriereController;
use App\Http\Controllers\Api\MaterielController;
use App\Http\Controllers\Api\ActionController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PointeurController;
use App\Http\Controllers\Api\SuperviseurController;

// ── Public ────────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);

// ── Authenticated (any role) ──────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/pannes', [PanneController::class, 'index']);

    Route::get('/materiels', [MaterielController::class, 'index']);
    Route::get('/materiels/{id}', [MaterielController::class, 'show']);

    Route::get('/pannes/{id}', [PanneController::class, 'show']);
    Route::get('/pannes/{panne}/actions', [PanneController::class, 'panneActions']);

    Route::apiResource('carrieres', CarriereController::class);

    // ── Pointeur-only ─────────────────────────────────────────
    Route::middleware('pointeur')->group(function () {
        Route::post('/pannes', [PanneController::class, 'store']);
        Route::put('/pannes/{id}/resolve', [PanneController::class, 'resolve']);
        Route::post('/pannes/{panne}/actions', [PanneController::class, 'storePanneAction']);
        Route::post('/materiels', [MaterielController::class, 'store']);
    });

    // ── Superviseur-only ──────────────────────────────────────
    Route::middleware('superviseur')->group(function () {
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

        Route::apiResource('pointeurs', PointeurController::class);
        Route::apiResource('superviseurs', SuperviseurController::class);
    });

    Route::apiResource('actions', ActionController::class);
});
