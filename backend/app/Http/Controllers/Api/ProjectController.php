<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use App\Models\Notification;
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

        $validatedData = $request->validate([
            'email' => 'required|email',
        ]);

        $userToInvite = User::where('email', $validatedData['email'])->first();

        if (!$userToInvite) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($project->members->contains($userToInvite) || $project->user_id === $userToInvite->id) {
            return response()->json(['message' => 'User is already a member of this project.'], 422);
        }

        // Use updateOrCreate to avoid duplicate invitations.
        // This will create a new invitation if one doesn't exist for this email,
        // or it will update an existing one (e.g., re-sending a declined invitation).
        $invitation = $project->invitations()->updateOrCreate(
            ['email' => $validatedData['email']], // Attributes to find the record
            ['status' => 'pending']              // Values to update or create with
        );

        // Create a notification for the invited user
        Notification::create([
            'user_id' => $userToInvite->id,
            'message' => "You have been invited to join the project '{$project->title}'.",
            'link' => "/projects/{$project->id}"
        ]);

        return response()->json([
            'message' => 'Invitation sent successfully.',
            'invitation' => $invitation,
            'user' => $userToInvite
        ]);
    }

    public function removeMember(Request $request, Project $project, User $user)
    {
        // Authorization: Only the project owner can remove members.
        if ($request->user()->id !== $project->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // A user cannot be removed if they are the project owner.
        if ($user->id === $project->user_id) {
            return response()->json(['message' => 'The project owner cannot be removed.'], 422);
        }

        // Detach the member from the project.
        $project->members()->detach($user->id);

        return response()->json(['message' => 'Member removed successfully.'], 200);
    }
}
