<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\TaskController;


Route::post('/register',         [AuthController::class, 'register']);
Route::post('/login',            [AuthController::class, 'login']);
Route::post('/reset-password',   [ResetPasswordController::class, 'reset']);


Route::middleware('auth:sanctum')->group(function () {
    // Logout: revoga todos os tokens do usuário atual
    Route::post('/logout', [AuthController::class, 'logout']);

    // Tarefas CRUD
    Route::get('/tasks',        [TaskController::class, 'index']);
    Route::post('/tasks',       [TaskController::class, 'store']);
    Route::put('/tasks/{task}', [TaskController::class, 'update']);
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);

    // Obter dados do usuário logado
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });
});
