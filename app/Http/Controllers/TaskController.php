<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests\StoreTaskRequest;
use App\Models\Task;
use App\Models\TaskAttachment;
use App\Services\TaskProcessingService;
use Inertia\Inertia;

class TaskController extends Controller
{
    protected $taskService;

    public function __construct(TaskProcessingService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function index()
    {
        $tasks = Task::with('attachments')
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return response()->json([
            'tasks' => $tasks
        ]);
    }

    public function store(StoreTaskRequest $request)
    {
        // 1. Create Task
        $task = Task::create([
            'user_id' => auth()->id(),
            'content' => $request->content,
            'status' => 'pending',
        ]);

        // 2. Handle Attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('task-attachments', 'public');

                TaskAttachment::create([
                    'task_id' => $task->id,
                    'file_path' => '/storage/' . $path,
                    'file_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        // 3. AI Processing
        $aiResult = $this->taskService->analyzeTask($task->content);

        // 4. Update Task with AI Metadata
        $task->update([
            'metadata' => $aiResult,
            'status' => 'processed',
        ]);

        $task->load('attachments');

        return back()->with('message', 'Mission submitted successfully!');
    }
}
