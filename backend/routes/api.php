<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\InvitationController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::delete('/profile', [AuthController::class, 'deleteAccount']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('/projects', ProjectController::class);
    Route::post('/projects/{project}/invite', [ProjectController::class, 'inviteMember']);
    Route::delete('/projects/{project}/members/{user}', [ProjectController::class, 'removeMember']);
    Route::get('/tasks', [TaskController::class, 'allUserTasks']);
    Route::apiResource('projects/{project}/tasks', TaskController::class)->scoped();
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::put('/user/password', [ProfileController::class, 'updatePassword']);
    Route::put('/user/profile', [ProfileController::class, 'updateProfile']);
    Route::post('/user/profile-picture', [ProfileController::class, 'updateProfilePicture']);
    Route::delete('/user/profile-picture', [ProfileController::class, 'removeProfilePicture']);

    // Invitations
    Route::get('/invitations', [InvitationController::class, 'index']);
    Route::post('/invitations/{invitation}/accept', [InvitationController::class, 'accept']);
    Route::post('/invitations/{invitation}/decline', [InvitationController::class, 'decline']);

    // Notifications routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
});
