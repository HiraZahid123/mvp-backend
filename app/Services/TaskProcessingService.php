<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class TaskProcessingService
{
    protected array $apiKeys = [];
    protected string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

    // Circuit breaker — opens after FAILURE_THRESHOLD consecutive failures,
    // stays open for OPEN_TTL seconds, then allows one probe through.
    private const CIRCUIT_KEY     = 'gemini_circuit_open';
    private const FAILURES_KEY    = 'gemini_consecutive_failures';
    private const FAILURE_THRESHOLD = 5;
    private const OPEN_TTL        = 120; // seconds

    // Hard cap on characters sent to the API to control token cost.
    private const MAX_INPUT_CHARS = 1200;

    public function __construct()
    {
        $this->apiKeys = array_values(array_filter(
            config('services.gemini.keys', [])
        ));

        // IMPORTANT: Do NOT fall back to VITE_GEMINI_API_KEY here.
        // VITE_* variables are bundled into frontend JavaScript by Vite and are
        // publicly visible to all site visitors. Using that key server-side means
        // the server-side key is always exposed in the browser build.
        // Set GEMINI_API_KEYS in .env to provide server-side keys only.
        if (empty($this->apiKeys)) {
            Log::error('No Gemini API keys configured (GEMINI_API_KEYS). AI features are unavailable.');
        }
    }

    /**
     * Call the Gemini API with caching and circuit-breaker protection.
     *
     * @param  int $cacheTtlSeconds  How long to cache a successful result.
     *                               Pass a short value (e.g. 300) for moderation.
     * @param  int $timeoutSeconds   Per-request HTTP timeout.
     * @return array                 Parsed JSON response, or [] on any failure.
     */
    public function generateContent(string $prompt, int $cacheTtlSeconds = 3600, int $timeoutSeconds = 10): array
    {
        if (empty($this->apiKeys)) {
            return [];
        }

        // Circuit breaker: if we recently exhausted all keys, skip calls entirely.
        if (Cache::get(self::CIRCUIT_KEY)) {
            Log::warning('Gemini circuit breaker is open — returning empty (fail-closed callers will block content).');
            return [];
        }

        $cacheKey = 'gemini_v1_' . md5($prompt);

        // Only return cached results that were previously successful (non-empty).
        $cached = Cache::get($cacheKey);
        if (is_array($cached) && !empty($cached)) {
            return $cached;
        }

        foreach ($this->apiKeys as $index => $key) {
            try {
                $response = Http::withHeaders(['Content-Type' => 'application/json'])
                    ->timeout($timeoutSeconds)
                    ->post("{$this->baseUrl}?key={$key}", [
                        'contents' => [
                            ['parts' => [['text' => $prompt]]],
                        ],
                        'generationConfig' => [
                            'maxOutputTokens' => 512,
                            'temperature'     => 0.1,
                        ],
                    ]);

                if ($response->successful()) {
                    $data   = $response->json();
                    $text   = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

                    Log::info("Gemini response (Key #$index): " . mb_substr($text, 0, 300));

                    $decoded = $this->parseJsonFromText($text);

                    if (is_array($decoded) && !empty($decoded)) {
                        // Success: reset failure state and cache the result.
                        Cache::forget(self::FAILURES_KEY);
                        Cache::forget(self::CIRCUIT_KEY);
                        Cache::put($cacheKey, $decoded, $cacheTtlSeconds);
                        return $decoded;
                    }

                    Log::warning("Gemini Key #$index returned unparseable response.");
                } else {
                    Log::warning("Gemini Key #$index HTTP {$response->status()} — trying next key.");
                }
            } catch (\Exception $e) {
                Log::error("Gemini Key #$index exception: " . $e->getMessage());
            }
        }

        // All keys failed — update circuit breaker counter.
        $failures = (int) Cache::get(self::FAILURES_KEY, 0) + 1;
        Cache::put(self::FAILURES_KEY, $failures, self::OPEN_TTL * 4);

        if ($failures >= self::FAILURE_THRESHOLD) {
            Cache::put(self::CIRCUIT_KEY, true, self::OPEN_TTL);
            Log::error("Gemini circuit breaker OPENED after {$failures} consecutive failures.");
        }

        Log::error('All Gemini API keys failed.');
        return [];
    }

    /**
     * Extract a JSON object from a raw text response (handles markdown fences).
     */
    private function parseJsonFromText(string $text): array
    {
        // 1. Clean up potential markdown fences
        $clean = preg_replace('/^```(?:json)?|```$/m', '', trim($text));
        
        // 2. Try direct decode
        $decoded = json_decode($clean, true);
        if (is_array($decoded)) {
            return $decoded;
        }

        // 3. Fallback: Try to find the first '{' and last '}' to extract the object
        $firstBracket = strpos($text, '{');
        $lastBracket = strrpos($text, '}');
        
        if ($firstBracket !== false && $lastBracket !== false) {
            $jsonCandidate = substr($text, $firstBracket, $lastBracket - $firstBracket + 1);
            $decoded = json_decode($jsonCandidate, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return [];
    }

    public function analyzeTask(string $taskContent): array
    {
        $taskContent = mb_substr($taskContent, 0, self::MAX_INPUT_CHARS, 'UTF-8');
        $taskContent = str_replace(['"', '\\'], ['', ''], $taskContent);

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

    protected function getFallbackResponse(): array
    {
        return [
            'category'       => 'Uncategorized',
            'timeline'       => null,
            'estimated_cost' => null,
            'summary'        => 'Task received. We will review it shortly.',
        ];
    }

    public function extractProfile(string $userDescription): array
    {
        $userDescription = mb_substr($userDescription, 0, self::MAX_INPUT_CHARS, 'UTF-8');
        $userDescription = str_replace(['"', '\\'], ['', ''], $userDescription);

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
            \"professional_bio\": \"Experienced carpenter with 5 years of practice specializing in...\"
        }";

        $result = $this->generateContent($prompt);

        return !empty($result) ? $result : [
            'skills'           => [],
            'years_experience' => 0,
            'main_category'    => 'General',
            'professional_bio' => $userDescription,
        ];
    }

    public function extractMissionRequirements(string $title, string $description): array
    {
        $title       = mb_substr($title, 0, 200, 'UTF-8');
        $description = mb_substr($description, 0, self::MAX_INPUT_CHARS, 'UTF-8');
        $title       = str_replace(['"', '\\'], ['', ''], $title);
        $description = str_replace(['"', '\\'], ['', ''], $description);

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
            'category'        => 'General',
        ];
    }
}
