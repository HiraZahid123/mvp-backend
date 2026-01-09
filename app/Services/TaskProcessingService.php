<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TaskProcessingService
{
    protected $apiKey;
    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key', env('VITE_GEMINI_API_KEY'));
    }

    public function analyzeTask(string $taskContent)
    {
        if (empty($this->apiKey)) {
            Log::warning('Gemini API key is missing.');
            return [
                'category' => 'General',
                'timeline' => null,
                'estimated_cost' => null,
                'summary' => 'Task received. AI analysis unavailable (Missing Key).',
            ];
        }

        try {
            $prompt = "You are an AI assistant for a task management platform. Analyze the following task description and extract the following information in JSON format:
            1. 'category' (e.g., 'Web Development', 'Design', 'Marketing', 'Writing', 'Other').
            2. 'timeline' (estimated duration or deadline if mentioned, otherwise null).
            3. 'estimated_cost' (estimated budget if mentioned, otherwise null).
            4. 'summary' (a brief, professional acknowledgment and summary of the task).

            Task Description: \"{$taskContent}\"

            Return ONLY the JSON object.";

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}?key={$this->apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $textValues = $data['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
                
                // Clean markdown code blocks if present
                $textValues = str_replace(['```json', '```'], '', $textValues);
                
                return json_decode(trim($textValues), true);
            } else {
                Log::error('Gemini API Error: ' . $response->body());
                return $this->getFallbackResponse();
            }
        } catch (\Exception $e) {
            Log::error('Task Analysis Exception: ' . $e->getMessage());
            return $this->getFallbackResponse();
        }
    }

    protected function getFallbackResponse()
    {
        return [
            'category' => 'Uncategorized',
            'timeline' => null,
            'estimated_cost' => null,
            'summary' => 'Task received. We will review it shortly.',
        ];
    }
}
