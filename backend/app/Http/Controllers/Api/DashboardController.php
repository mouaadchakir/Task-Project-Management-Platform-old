<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();

        $totalProjects = $user->ownedProjects()->count();

        // Get task counts by status for the charts
        $tasksTodo = $user->allTasksInOwnedProjects()->where('status', 'todo')->count();
        $tasksInProgress = $user->allTasksInOwnedProjects()->where('status', 'in-progress')->count();
        $tasksDone = $user->allTasksInOwnedProjects()->where('status', 'done')->count();

        return response()->json([
            'total_projects' => $totalProjects,
            'tasks_in_progress' => $tasksInProgress,
            'completed_tasks' => $tasksDone,
            'tasks_by_status' => [
                ['name' => 'Todo', 'value' => $tasksTodo],
                ['name' => 'In Progress', 'value' => $tasksInProgress],
                ['name' => 'Done', 'value' => $tasksDone],
            ]
        ]);
    }
}
