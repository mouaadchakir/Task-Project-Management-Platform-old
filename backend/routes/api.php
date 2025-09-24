<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProfileController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('/projects', ProjectController::class);
    Route::post('/projects/{project}/invite', [ProjectController::class, 'inviteMember']);
    Route::get('/tasks', [TaskController::class, 'allUserTasks']);
    Route::apiResource('projects/{project}/tasks', TaskController::class)->scoped();
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::put('/user/password', [ProfileController::class, 'updatePassword']);
    Route::put('/user/profile', [ProfileController::class, 'updateProfile']);
    Route::post('/user/profile-picture', [ProfileController::class, 'updateProfilePicture']);
    Route::delete('/user/profile-picture', [ProfileController::class, 'removeProfilePicture']);
});
