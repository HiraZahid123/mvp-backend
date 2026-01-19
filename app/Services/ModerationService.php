<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class ModerationService
{
    protected $taskService;

    public function __construct(\App\Services\TaskProcessingService $taskService)
    {
        $this->taskService = $taskService;
    }

    /**
     * Common forbidden patterns for moderation.
     */
    protected array $forbiddenPatterns = [
        '/\b(d[ru\-\. ]*g|cannabis|w[e3]{2}d|coca[i1]ne|hero[i1]ne|ecstasy|pillen|stupéfiants|drogue)\b/i',
        '/\b(s[e3]x|p[o0]rn|escort|hooker|slut|sexy|prostitution|érotique)\b/i',
        '/\b(alcoh[o0]l|vodka|whisky|beer|booze|alcool|bière)\b/i',
        '/\b(violence|kill|murder|bomb|weapon|gun|knife|tuer|meurtre|arme)\b/i',
        '/\b(illegal|stolen|theft|fraud|hack|volé|fraude|piratage)\b/i',
        '/\b(fuck|shit|assh[o0]le|bitch|bastard|dick|pussy|merde|connard|salope|putain|bordel|cul|pute)\b/i',
    ];

    /**
     * Rapid check using regex. Good for real-time typing.
     */
    public function isCleanFast(string $content): bool
    {
        if (empty($content)) return true;
        
        // Normalize content for better regex matching (strip spaces/dots between letters)
        $normalized = preg_replace('/(\w)\s+(\w)/', '$1$2', $content);
        
        foreach ($this->forbiddenPatterns as $pattern) {
            if (preg_match($pattern, $content) || preg_match($pattern, $normalized)) return false;
        }
        return true;
    }

    /**
     * Deep check using AI. Handles double-meanings, sentences, and context.
     */
    public function isCleanAI(string $content): array
    {
        if (empty($content)) return ['is_clean' => true, 'improved_title' => null];

        $prompt = "You are a content moderator and professional editor for Oflem, a premium Swiss platform.
        Analyze this mission text for any violations (drugs, illegal services, adult content, violence, fraud, or hidden double meanings).
        
        Mission Text: \"{$content}\"
        
        Task:
        1. Check if the content is safe and professional.
        2. If (and ONLY if) the content is clean, generate a more comprehensive, professional, and clear version of this title (max 5-8 words).
        3. Suggest a high-level category (e.g., Cleaning, Moving, DIY, IT, Admin, Delivery, Pets, Gardening, Events, Education, Wellness, Other).
        
        CRITICAL: Watch for bypass attempts (e.g., symbols, spaces, or numbers used to hide prohibited words).
        
        Return ONLY a JSON object with:
        {
          \"is_clean\": boolean,
          \"reason\": \"Brief reason if not clean, else null\",
          \"risk_level\": \"high|medium|low\",
          \"improved_title\": \"The polished, professional title (only if clean)\",
          \"category\": \"The suggested category\"
        }";

        try {
            $result = $this->taskService->generateContent($prompt);
            
            Log::debug('AI Moderation & Title Gen Raw:', ['result' => $result]);
            
            return [
                'is_clean' => (bool) ($result['is_clean'] ?? false),
                'improved_title' => $result['improved_title'] ?? null,
                'category' => $result['category'] ?? 'Other',
                'reason' => $result['reason'] ?? null,
                'risk_level' => $result['risk_level'] ?? 'low'
            ];
        } catch (\Exception $e) {
            Log::error("AI Moderation/Title Gen failed: " . $e->getMessage());
            return ['is_clean' => false, 'improved_title' => null]; // Fail-closed
        }
    }

    public function getViolations(string $content): array
    {
        $violations = [];
        $categories = ['drugs', 'sex', 'alcohol', 'violence', 'illegal', 'profanity'];

        foreach ($this->forbiddenPatterns as $index => $pattern) {
            if (preg_match($pattern, $content)) {
                $violations[] = $categories[$index];
            }
        }

        return $violations;
    }
}
