<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function allUserTasks(Request $request)
    {
        $user = $request->user();

        // Get tasks from projects the user owns
        $ownedProjectsTasks = $user->allTasksInOwnedProjects()->with('project', 'assignee')->get();

        // Get tasks from projects the user is a member of
        $memberOfProjectsTasks = collect();
        $user->memberOfProjects->each(function ($project) use (&$memberOfProjectsTasks) {
            $memberOfProjectsTasks = $memberOfProjectsTasks->merge($project->tasks()->with('project', 'assignee')->get());
        });

        // Merge and return unique tasks
        return $ownedProjectsTasks->merge($memberOfProjectsTasks)->unique('id')->values();
    }

    public function index(Request $request, \App\Models\Project $project)
    {
        if ($request->user()->id !== $project->user_id && !$project->members->contains($request->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $project->tasks()->with('assignee')->get();
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
            'assignee_id' => 'nullable|exists:users,id',
        ]);

        $task = $project->tasks()->create($validatedData);

        return response()->json($task, 201);
    }

    public function show(Request $request, \App\Models\Project $project, \App\Models\Task $task)
    {
        if ($request->user()->id !== $task->project->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $task;
    }

    public function update(Request $request, \App\Models\Project $project, \App\Models\Task $task)
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
            'assignee_id' => 'nullable|exists:users,id',
        ]);

        $task->update($validatedData);

        return response()->json($task);
    }

    public function destroy(Request $request, \App\Models\Project $project, \App\Models\Task $task)
    {
        if ($request->user()->id !== $task->project->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task->delete();

        return response()->json(null, 204);
    }
}
