<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleSelectionController extends Controller
{
    /**
     * Show the role selection form.
     */
    public function create(Request $request)
    {
        return Inertia::render('Auth/SelectRole', [
            'intended' => $request->session()->get('url.intended'),
        ]);
    }

    /**
     * Store the selected role in session and redirect to registration.
     */
    public function store(Request $request)
    {
        $request->validate([
            'role' => 'required|in:customer,performer,both',
        ]);

        // Store the selected role in session
        $request->session()->put('selected_role', $request->role);

        // Redirect to registration
        return redirect()->route('register');
    }
}
