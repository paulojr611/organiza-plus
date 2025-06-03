<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use App\Models\TaskCompletion;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $tasks = $user->tasks()
            ->orderBy('due_date')
            ->get();

        return $tasks;
    }

    public function updateStatus(Request $request, Task $task)
    {
        $request->validate([
            'status' => 'required|in:Não iniciada,Em andamento,Concluída'
        ]);

        if ($task->user_id !== auth()->id()) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $task->status = $request->status;
        $task->completed = $request->status === 'Concluída';
        $task->save();

        return response()->json(['message' => 'Status atualizado com sucesso!', 'task' => $task]);
    }

  public function store(Request $request)
{
    $hasMultipleDates = is_array($request->due_date);

    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'due_date' => $hasMultipleDates ? 'required|array|min:1' : 'required|date',
        'due_date.*' => $hasMultipleDates ? 'required|date' : '',
    ]);

    $userId = auth()->id();
    $tasks = [];

    if ($hasMultipleDates) {
        foreach ($validated['due_date'] as $date) {
            $tasks[] = Task::create([
                'user_id' => $userId,
                'title' => $validated['title'],
                'due_date' => $date,
                'completed' => false,
            ]);
        }
    } else {
        $tasks[] = Task::create([
            'user_id' => $userId,
            'title' => $validated['title'],
            'due_date' => $validated['due_date'],
            'completed' => false,
        ]);
    }

    return response()->json([
        'message' => count($tasks) > 1 ? 'Tarefas criadas com sucesso!' : 'Tarefa criada com sucesso!',
        'data' => $tasks,
    ], 201);
}


    public function update(Request $request, Task $task)
    {
        $this->authorize('update', $task);

        $data = $request->validate([
            'title' => 'string|max:255',
            'due_date' => 'nullable|date',
            'completed' => 'boolean',
        ]);

        $task->update($data);

        return response()->json($task);
    }

    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);

        $task->delete();

        return response()->json(['message' => 'Tarefa deletada']);
    }

    public function completeToday(Task $task)
    {
        $user = auth()->user();

        if ($task->user_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        TaskCompletion::firstOrCreate([
            'task_id' => $task->id,
            'date' => today()->toDateString(),
        ]);

        return response()->json(['message' => 'Tarefa marcada como concluída para hoje.']);
    }
}
