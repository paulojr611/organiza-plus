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
        $task->completed = $request->status === 'Concluída' ? true : false;
        $task->save();

        return response()->json(['message' => 'Status atualizado com sucesso!', 'task' => $task]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'due_date' => 'required|date',
            'recurrence' => 'nullable|array',
            'recurrence.*' => 'in:seg,ter,qua,qui,sex,sab,dom',
        ]);

        $task = new Task();
        $task->user_id = auth()->id();  // associa a tarefa ao usuário logado
        $task->title = $validated['title'];
        $task->due_date = $validated['due_date'];
        $task->recurrence = $validated['recurrence'] ?? null;
        $task->completed = false;
        $task->save();

        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task)
    {
        $this->authorize('update', $task);

        $data = $request->validate([
            'title' => 'string|max:255',
            'due_date' => 'nullable|date',
            'completed' => 'boolean',
            'recurrence' => 'nullable|array',
            'recurrence.*' => 'in:seg,ter,qua,qui,sex,sab,dom',
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
