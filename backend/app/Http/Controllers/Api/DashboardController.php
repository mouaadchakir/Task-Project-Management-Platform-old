<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();

        $totalProjects = $user->projects()->count();

        // Get task counts by status for the charts
        $tasksTodo = $user->tasks()->where('status', 'todo')->count();
        $tasksInProgress = $user->tasks()->where('status', 'in-progress')->count();
        $tasksDone = $user->tasks()->where('status', 'done')->count();

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
