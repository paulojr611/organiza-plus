<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Goal;

class GoalController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->goals()->get();
    }

    public function update(Request $request, Goal $goal)
    {
        $this->authorize('update', $goal);

        $request->validate([
            'completed' => 'required|integer|min:0|max:' . $goal->target_value,
            'title' => 'sometimes|string|max:255', // ← Permitir alterar título
        ]);

        if ($request->has('completed')) {
            $goal->completed = $request->completed;
        }

        if ($request->has('title')) {
            $goal->title = $request->title;
        }

        $goal->save();

        return response()->json($goal);
    }


    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'target_value' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $goal = Goal::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'target_value' => $request->target_value,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ]);

        return response()->json($goal, 201);
    }

    public function destroy(Goal $goal)
    {
        $this->authorize('delete', $goal);
        $goal->delete();
        return response()->json(['message' => 'Meta deletada com sucesso']);
    }


}

