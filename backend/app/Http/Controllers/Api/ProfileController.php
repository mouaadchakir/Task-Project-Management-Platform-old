<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function updatePassword(Request $request)
    {
        $validatedData = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($validatedData['password']),
        ]);

        return response()->json(['message' => 'Password updated successfully.']);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validatedData = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        ]);

        $user->update($validatedData);

        return response()->json(['message' => 'Profile updated successfully.', 'user' => $user]);
    }

    public function updateProfilePicture(Request $request)
    {
        $request->validate([
            'profile_picture' => ['required', 'image', 'max:2048'], // Max 2MB
        ]);

        $user = $request->user();

        // Store the new picture
        $path = $request->file('profile_picture')->store('profile-pictures', 'public');

        // Update the user's profile picture path
        $user->update(['profile_picture_path' => $path]);

        return response()->json(['message' => 'Profile picture updated successfully.', 'path' => $path]);
    }
}
