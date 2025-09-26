<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ProjectInvitation;


class InvitationController extends Controller
{
    public function index(Request $request)
    {
        return ProjectInvitation::where('email', $request->user()->email)
            ->where('status', 'pending')
            ->with('project') // To show project details with the invitation
            ->latest()
            ->get();
    }

    public function accept(Request $request, ProjectInvitation $invitation)
    {
        // Ensure the invitation is for the authenticated user
        if ($invitation->email !== $request->user()->email) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Add the user to the project members, if not already a member
        if (!$invitation->project->members->contains($request->user())) {
            $invitation->project->members()->attach($request->user()->id);
        }

        // Update the invitation status
        $invitation->update(['status' => 'accepted']);

        return response()->json(['message' => 'Invitation accepted successfully.']);
    }

    public function decline(Request $request, ProjectInvitation $invitation)
    {
        // Ensure the invitation is for the authenticated user
        if ($invitation->email !== $request->user()->email) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Update the invitation status
        $invitation->update(['status' => 'declined']);

        return response()->json(['message' => 'Invitation declined successfully.']);
    }
}
