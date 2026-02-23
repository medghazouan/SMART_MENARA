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
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ── Authenticated (any role) ──────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    Route::get('/materiels', [MaterielController::class, 'index']);
    Route::get('/materiels/{id}/statistics', [MaterielController::class, 'statistics']);
    Route::get('/materiels/{id}', [MaterielController::class, 'show']);
    Route::post('/materiels', [MaterielController::class, 'store']);

    Route::get('/pannes/{id}', [PanneController::class, 'show']);
    Route::get('/pannes/{panne}/actions', [PanneController::class, 'panneActions']);

    Route::get('/carrieres', [CarriereController::class, 'index']);
    Route::get('/carrieres/{id}', [CarriereController::class, 'show']);

    Route::get('/actions', [ActionController::class, 'index']);
    Route::get('/actions/{id}', [ActionController::class, 'show']);

    // ── Pointeur-only ─────────────────────────────────────────
    Route::middleware('pointeur')->group(function () {
        Route::get('/my-pannes', [PanneController::class, 'myPannes']);
        Route::post('/pannes', [PanneController::class, 'store']);
        Route::put('/pannes/{id}/resolve', [PanneController::class, 'resolve']);
        Route::post('/pannes/{panne}/actions', [PanneController::class, 'storePanneAction']);

        Route::post('/actions', [ActionController::class, 'store']);
        Route::put('/actions/{id}', [ActionController::class, 'update']);
        Route::delete('/actions/{id}', [ActionController::class, 'destroy']);
    });

    // ── Superviseur-only ──────────────────────────────────────
    Route::middleware('superviseur')->group(function () {
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/pannes', [PanneController::class, 'index']);

        Route::get('/notifications/count', [NotificationController::class, 'count']);
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

        Route::post('/carrieres', [CarriereController::class, 'store']);
        Route::put('/carrieres/{id}', [CarriereController::class, 'update']);
        Route::delete('/carrieres/{id}', [CarriereController::class, 'destroy']);

        Route::put('/materiels/{id}', [MaterielController::class, 'update']);
        Route::delete('/materiels/{id}', [MaterielController::class, 'destroy']);

        Route::apiResource('pointeurs', PointeurController::class);
        Route::apiResource('superviseurs', SuperviseurController::class);
    });
});
