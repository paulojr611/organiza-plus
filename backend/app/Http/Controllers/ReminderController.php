<?php

namespace App\Http\Controllers;

use App\Models\Reminder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReminderController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }


    public function index()
    {
        return Auth::user()
                   ->reminders()
                   ->orderBy('remind_at')
                   ->get();
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'remind_at'   => 'required|date|after_or_equal:now',
        ]);

        $reminder = Auth::user()
                        ->reminders()
                        ->create($validated);

        return response()->json($reminder, 201);
    }


    public function update(Request $request, Reminder $reminder)
    {
        $this->authorize('update', $reminder);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            //'description' => 'nullable|string',
            //'remind_at'   => 'required|date|after_or_equal:now',
        ]);

        $reminder->update($validated);

        return response()->json($reminder);
    }

    public function destroy(Reminder $reminder)
    {
        $this->authorize('delete', $reminder);

        $reminder->delete();

        return response()->noContent();
    }
}
