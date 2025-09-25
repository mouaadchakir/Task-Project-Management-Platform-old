<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $ownedProjects = $user->ownedProjects()->with('members')->latest()->get();
        $memberOfProjects = $user->memberOfProjects()->with('members')->latest()->get();

        // Filter out owned projects from the list of projects the user is a member of
        $sharedProjects = $memberOfProjects->reject(function ($project) use ($ownedProjects) {
            return $ownedProjects->contains('id', $project->id);
        });

        return response()->json([
            'owned' => $ownedProjects,
            'shared' => $sharedProjects,
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'deadline' => 'required|date',
        ]);

        $project = $request->user()->ownedProjects()->create($validatedData);

        // Automatically add the owner as a member of the project
        $project->members()->attach($request->user()->id);

        return response()->json($project, 201);
    }

    public function show(Request $request, Project $project)
    {
        if ($request->user()->id !== $project->user_id && !$project->members->contains($request->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $project->load('members');
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

    public function destroy(Request $request, Project $project)
    {
        if ($request->user()->id !== $project->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }

    public function inviteMember(Request $request, Project $project)
    {
        if ($request->user()->id !== $project->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate(['email' => 'required|email|exists:users,email']);

        $userToInvite = User::where('email', $request->email)->first();

        if ($project->members->contains($userToInvite)) {
            return response()->json(['message' => 'User is already a member of this project.'], 422);
        }

        $project->members()->attach($userToInvite->id);

        return response()->json(['message' => 'User invited successfully.', 'user' => $userToInvite]);
    }
}
