<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\TaskController;


Route::middleware('auth:sanctum')->group(function() {
    Route::get    ('/tasks',        [TaskController::class, 'index']);
    Route::post   ('/tasks',        [TaskController::class, 'store']);
    Route::put    ('/tasks/{task}', [TaskController::class, 'update']);
    Route::delete ('/tasks/{task}', [TaskController::class, 'destroy']);
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/reset-password', [ResetPasswordController::class, 'reset']);


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
