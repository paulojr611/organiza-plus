<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct()
    {
        // Garante que só usuários autenticados acessem
        $this->middleware('auth:sanctum');
    }

    /**
     * Listar todas as tarefas do usuário.
     */
    public function index(Request $request)
    {
        $tasks = $request->user()
                         ->tasks()
                         ->orderBy('due_date', 'asc')
                         ->get();

        return TaskResource::collection($tasks);
    }

    /**
     * Criar uma nova tarefa.
     */
    public function store(StoreTaskRequest $request)
    {
        $task = $request->user()->tasks()->create($request->validated());

        return (new TaskResource($task))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Mostrar uma tarefa específica.
     */
    public function show(Task $task)
    {
        $this->authorize('view', $task);

        return new TaskResource($task);
    }

    /**
     * Atualizar os dados de uma tarefa.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        $this->authorize('update', $task);

        $task->update($request->validated());

        return new TaskResource($task);
    }

    /**
     * Remover uma tarefa.
     */
    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);

        $task->delete();

        return response()->noContent();
    }
}
