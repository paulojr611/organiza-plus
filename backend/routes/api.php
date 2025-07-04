<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\SubtaskController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/reset-password', [ResetPasswordController::class, 'reset']);


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

   // Tarefas CRUD
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::put('/tasks/{task}', [TaskController::class, 'update']);
    Route::put('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::put('/tasks/{task}/notes', [TaskController::class, 'updateNotes']);  
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);

    Route::get('/subtasks', [SubtaskController::class, 'index']);
    Route::post('/subtasks', [SubtaskController::class, 'store']);
    Route::put('/subtasks/{subtask}', [SubtaskController::class, 'update']);
    Route::delete('/subtasks/{subtask}', [SubtaskController::class, 'destroy']);

    Route::get('/goals', [GoalController::class, 'index']);
    Route::post('/goals', [GoalController::class, 'store']);
    Route::put('/goals/{goal}', [GoalController::class, 'update']);
    Route::delete('/goals/{goal}', [GoalController::class, 'destroy']);

    Route::get('/reminders', [ReminderController::class, 'index']);
    Route::post('/reminders', [ReminderController::class, 'store']);
    Route::post('/reminders/{reminder}/notify', [ReminderController::class, 'notify']);
    Route::put('/reminders/{reminder}', [ReminderController::class, 'update']);
    Route::patch('/reminders/{reminder}', [ReminderController::class, 'update']);
    Route::delete('/reminders/{reminder}', [ReminderController::class, 'destroy']);

    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });
});
