<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->projects;
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'deadline' => 'required|date',
        ]);

        $project = $request->user()->projects()->create($validatedData);

        return response()->json($project, 201);
    }

    public function show(Request $request, \App\Models\Project $project)
    {
        if ($request->user()->id !== $project->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $project;
    }

    public function update(Request $request, \App\Models\Project $project)
    {
        if ($request->user()->id !== $project->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validatedData = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'deadline' => 'sometimes|required|date',
        ]);

        $project->update($validatedData);

        return response()->json($project);
    }

    public function destroy(Request $request, \App\Models\Project $project)
    {
        if ($request->user()->id !== $project->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $project->delete();

        return response()->json(null, 204);
    }
}
