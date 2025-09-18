<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request, \App\Models\Project $project)
    {
        if ($request->user()->id !== $project->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $project->tasks;
    }

    public function store(Request $request, \App\Models\Project $project)
    {
        if ($request->user()->id !== $project->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high',
            'status' => 'required|in:todo,in-progress,done',
            'deadline' => 'required|date',
        ]);

        $task = $project->tasks()->create($validatedData);

        return response()->json($task, 201);
    }

    public function show(Request $request, \App\Models\Task $task)
    {
        if ($request->user()->id !== $task->project->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $task;
    }

    public function update(Request $request, \App\Models\Task $task)
    {
        if ($request->user()->id !== $task->project->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validatedData = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'priority' => 'sometimes|required|in:low,medium,high',
            'status' => 'sometimes|required|in:todo,in-progress,done',
            'deadline' => 'sometimes|required|date',
        ]);

        $task->update($validatedData);

        return response()->json($task);
    }

    public function destroy(Request $request, \App\Models\Task $task)
    {
        if ($request->user()->id !== $task->project->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task->delete();

        return response()->json(null, 204);
    }
}
