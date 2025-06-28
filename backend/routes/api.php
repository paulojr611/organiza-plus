<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\SubtaskController;


Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();
    return response()->json(['message' => 'E-mail verificado com sucesso!']);
})->middleware('signed')->name('verification.verify');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/reset-password', [ResetPasswordController::class, 'reset']);

Route::middleware('auth:sanctum')->group(function () {
    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Reenviar link de verificação de e-mail
    Route::post('/email/verification-notification', function (Request $request) {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'E-mail já verificado.'], 400);
        }
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Link de verificação enviado!']);
    })->name('verification.send');

    // Tarefas CRUD
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::put('/tasks/{task}', [TaskController::class, 'update']);
    Route::put('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::put('/tasks/{task}/notes', [TaskController::class, 'updateNotes']);  
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);

    // Subtarefas CRUD
    Route::get('/subtasks', [SubtaskController::class, 'index']);
    Route::post('/subtasks', [SubtaskController::class, 'store']);
    Route::put('/subtasks/{subtask}', [SubtaskController::class, 'update']);
    Route::delete('/subtasks/{subtask}', [SubtaskController::class, 'destroy']);

    // Metas CRUD
    Route::get('/goals', [GoalController::class, 'index']);
    Route::post('/goals', [GoalController::class, 'store']);
    Route::put('/goals/{goal}', [GoalController::class, 'update']);
    Route::delete('/goals/{goal}', [GoalController::class, 'destroy']);

    // Lembretes CRUD
    Route::get('/reminders', [ReminderController::class, 'index']);
    Route::post('/reminders', [ReminderController::class, 'store']);
    Route::post('/reminders/{reminder}/notify', [ReminderController::class, 'notify']);
    Route::put('/reminders/{reminder}', [ReminderController::class, 'update']);
    Route::patch('/reminders/{reminder}', [ReminderController::class, 'update']);
    Route::delete('/reminders/{reminder}', [ReminderController::class, 'destroy']);

    // Usuário autenticado
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });
});
