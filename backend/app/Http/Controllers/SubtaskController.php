<?php

namespace App\Http\Controllers;

use App\Models\Subtask;
use Illuminate\Http\Request;

class SubtaskController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->query('date', today()->toDateString());

        $subs = Subtask::whereHas('task', function ($q) use ($date) {
            $q->whereDate('due_date', $date);
        })
            ->with('task:id,title,due_date')
            ->get();

        return response()->json($subs);
    }
     public function store(Request $request)
    {
        $data = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'title'   => 'required|string|max:255',
        ]);

        $sub = Subtask::create([
            'task_id' => $data['task_id'],
            'title'   => $data['title'],
            'status'  => 'Não iniciada',
        ]);

        return response()->json($sub, 201);
    }
    public function update(Request $request, Subtask $subtask)
    {
        $request->validate([
            'status' => 'required|in:Não iniciada,Concluída',
        ]);

        $subtask->status = $request->status;
        $subtask->save();

        return response()->json($subtask);
    }


    public function destroy(Subtask $subtask)
    {
        $subtask->delete();

        return response()->json(null, 204);
    }
}