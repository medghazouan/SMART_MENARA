<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PanneController;
use App\Http\Controllers\Api\CarriereController;
use App\Http\Controllers\Api\MaterielController;
use App\Http\Controllers\Api\ActionController;

// Public routes
Route::post('/login/superviseur', [AuthController::class, 'loginSuperviseur']);
Route::post('/login/pointeur', [AuthController::class, 'loginPointeur']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Pannes
    Route::apiResource('pannes', PanneController::class);
    Route::get('/pannes-statistics', [PanneController::class, 'statistics']);
    
    // Carrieres
    Route::apiResource('carrieres', CarriereController::class);
    
    // Materiels
    Route::apiResource('materiels', MaterielController::class);
    
    // Actions
    Route::apiResource('actions', ActionController::class);
});