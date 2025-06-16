<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Subtask;
use Illuminate\Http\Request;
use App\Models\TaskCompletion;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $tasks = $user->tasks()
            ->with('subtasks')        
            ->orderBy('due_date')
            ->get();

        return response()->json($tasks);
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
            'due_date' => $hasMultipleDates
                ? 'required|array|min:1'
                : 'required|date',
            'due_date.*' => $hasMultipleDates
                ? 'required|date'
                : '',
            'subtasks' => 'nullable|array',
            'subtasks.*.title' => 'required_with:subtasks|string|max:255',
            'subtasks.*.status' => 'in:Não iniciada,Em andamento,Concluída',
        ]);

        $userId = auth()->id();
        $created = [];

        $dates = $hasMultipleDates
            ? $validated['due_date']
            : [$validated['due_date']];

        foreach ($dates as $date) {
            $task = Task::create([
                'user_id' => $userId,
                'title' => $validated['title'],
                'due_date' => $date,
                'completed' => false,
            ]);

            if (!empty($validated['subtasks'])) {
                foreach ($validated['subtasks'] as $sub) {
                    $task->subtasks()->create([
                        'title' => $sub['title'],
                        'status' => $sub['status'] ?? 'Não iniciada',
                    ]);
                }
                $task->load('subtasks');
            }

            $created[] = $task;
        }

        return response()->json([
            'message' => count($created) > 1
                ? 'Tarefas criadas com sucesso!'
                : 'Tarefa criada com sucesso!',
            'data' => $created,
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
