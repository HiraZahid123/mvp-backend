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
     * Updated to be more specific and avoid blocking legitimate everyday tasks.
     */
    protected array $forbiddenPatterns = [
        // Drugs - more specific patterns
        '/\b(cannabis|w[e3]{2}d|coca[i1]ne|hero[i1]ne|ecstasy|mdma|lsd|meth|crack|stupéfiants)\b/i',
        // Adult content - specific terms only
        '/\b(p[o0]rn|escort|hooker|prostitution|érotique|xxx|adult\s*content)\b/i',
        // Violence - specific threats only (removed generic "violence", "weapon", "knife")
        '/\b(kill|murder|bomb|terrorist|assassin|tuer|meurtre|terroriste)\b/i',
        // Illegal activities - specific crimes only
        '/\b(stolen|theft|fraud|hack|scam|counterfeit|volé|fraude|piratage|arnaque)\b/i',
        // Extreme profanity only (removed mild words like "shit", "merde")
        '/\b(fuck|assh[o0]le|bitch|bastard|dick|pussy|connard|salope|pute)\b/i',
    ];

    /**
     * Whitelist of legitimate terms that might trigger false positives.
     */
    protected array $whitelistedPhrases = [
        'promener mon chien',
        'walk my dog',
        'sortir le chien',
        'dog walking',
        'pet sitting',
        'garde d\'animaux',
        'nourrir mon chat',
        'feed my cat',
    ];

    /**
     * Rapid check using regex. Good for real-time typing.
     */
    public function isCleanFast(string $content): bool
    {
        if (empty($content)) return true;
        
        // Check whitelist first - if it matches a known legitimate phrase, allow it
        $contentLower = strtolower($content);
        foreach ($this->whitelistedPhrases as $phrase) {
            if (stripos($contentLower, strtolower($phrase)) !== false) {
                return true;
            }
        }
        
        // Normalize content for better regex matching (strip spaces/dots/dashes between letters)
        $normalized = preg_replace('/(?<=\w)[\s\.\-\_]+(?=\w)/', '', $content);
        
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
        
        IMPORTANT GUIDELINES:
        - ALLOW everyday tasks like dog walking, pet sitting, grocery shopping, cleaning, moving, gardening, etc.
        - ALLOW tasks involving alcohol delivery or purchase (e.g., buying wine, beer delivery) as these are legal services
        - BLOCK only genuinely harmful content: hard drugs, illegal weapons, adult services, violence, fraud
        - Be LENIENT with common everyday requests - err on the side of allowing legitimate tasks
        - Watch for bypass attempts (e.g., symbols, spaces, or numbers used to hide prohibited words)
        
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
            
            // Fail-open strategy: Allow content but flag for manual review
            // This prevents service outages from blocking legitimate users
            return [
                'is_clean' => true, 
                'improved_title' => null,
                'needs_manual_review' => true,
                'ai_error' => true
            ];
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
