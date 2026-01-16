<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TaskProcessingService
{
    protected $apiKey;
    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key', env('VITE_GEMINI_API_KEY'));
    }

    public function generateContent(string $prompt)
    {
        if (empty($this->apiKey)) {
            Log::warning('Gemini API key is missing.');
            return [];
        }

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->timeout(10)->post("{$this->baseUrl}?key={$this->apiKey}", [
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
                
                // Log raw response for debugging
                Log::info('Raw Gemini Response: ' . $textValues);

                // Robust JSON Extraction: 
                // Sometimes AI returns conversational text before/after JSON.
                // We use regex to find the first '{' and last '}'
                if (preg_match('/\{(?:[^{}]|(?R))*\}/s', $textValues, $matches)) {
                    $jsonContent = $matches[0];
                    return json_decode(trim($jsonContent), true);
                }

                // Fallback for simple string replacement if regex fails
                $textValues = str_replace(['```json', '```'], '', $textValues);
                return json_decode(trim($textValues), true);
            } else {
                Log::error('Gemini API Error (' . $response->status() . '): ' . $response->body());
                return [];
            }
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Gemini Timeout/Connection Exception: ' . $e->getMessage());
            return [];
        } catch (\Exception $e) {
            Log::error('Gemini General Exception: ' . $e->getMessage());
            return [];
        }
    }

    public function analyzeTask(string $taskContent)
    {
        $prompt = "You are an AI assistant for a task management platform. Analyze the following task description and extract the following information in JSON format:
        1. 'category' (e.g., 'Construction', 'Cleaning', 'IT', 'Education', 'Care', 'Health', 'Transport', 'Events', 'Other').
        2. 'timeline' (estimated duration or deadline if mentioned, otherwise null).
        3. 'estimated_cost' (estimated budget if mentioned, otherwise null).
        4. 'summary' (a brief, professional acknowledgment and summary of the task).

        Task Description: \"{$taskContent}\"

        Return ONLY the JSON object.";

        $result = $this->generateContent($prompt);
        return !empty($result) ? $result : $this->getFallbackResponse();
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

    public function extractProfile(string $userDescription)
    {
        $prompt = "You are an AI recruiter for Oflem, a premium Swiss help platform. 
        Analyze the following provider description and extract structured professional data.

        Provider Input: \"{$userDescription}\"

        Task:
        1. Extract a list of specific skills (technical or soft). For each, estimate proficiency (beginner, intermediate, expert).
        2. Estimate 'years_experience' if mentioned (default to 0 if not).
        3. Determine the 'main_category' of their service (e.g., 'Construction', 'Cleaning', 'IT', 'Education', 'Care').
        4. Write a 'professional_bio': A polished, third-person summary of their expertise (max 50 words).

        CRITICAL INSTRUCTION: Return ONLY a raw JSON object.
        Structure:
        {
            \"skills\": [
                {\"name\": \"Carpentry\", \"proficiency\": \"expert\"},
                {\"name\": \"Customer Service\", \"proficiency\": \"intermediate\"}
            ],
            \"years_experience\": 5,
            \"main_category\": \"Construction\",
            \"professional_bio\": \"Experienced carpenter with 5 years of practice specalizing in...\"
        }";

        $result = $this->generateContent($prompt);

        return !empty($result) ? $result : [
            'skills' => [],
            'years_experience' => 0,
            'main_category' => 'General',
            'professional_bio' => $userDescription
        ];
    }
    public function extractMissionRequirements(string $title, string $description)
    {
        $prompt = "You are an AI algorithm for a job platform. 
        Analyze this mission and extract REQUIRED SKILLS for a provider to have.

        Mission Title: \"{$title}\"
        Description: \"{$description}\"

        Task:
        1. Extract 3-5 specific technical or soft skills required to complete this task.
        2. Assign a 'importance' weight (must_have, nice_to_have) to each.
        3. Suggest a 'category'.

        CRITICAL INSTRUCTION: Return ONLY a raw JSON object.
        Structure:
        {
            \"required_skills\": [
                {\"name\": \"Carpentry\", \"importance\": \"must_have\"},
                {\"name\": \"Heavy Lifting\", \"importance\": \"nice_to_have\"}
            ],
            \"category\": \"Construction\"
        }";

        $result = $this->generateContent($prompt);

        return !empty($result) ? $result : [
            'required_skills' => [],
            'category' => 'General'
        ];
    }
}
