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
     * Multilingual forbidden patterns for comprehensive content moderation.
     * Covers: English, French, Arabic, Urdu, Spanish, German, Italian
     * 
     * Pattern categories:
     * 1. Drugs and narcotics
     * 2. Adult/sexual content
     * 3. Violence and terrorism
     * 4. Illegal activities
     * 5. Extreme profanity
     */
    protected array $forbiddenPatterns = [
        // ========== DRUGS & NARCOTICS ==========
        // English, French, Spanish, German, Italian
        '/\b(cannabis|w[e3]{2}d|marijuana|coca[i1]ne|hero[i1]ne|heroin|ecstasy|mdma|lsd|meth|crack|drug[s]?|narcotic[s]?)\b/iu',
        '/\b(stupéfiants?|drogue[s]?|marihuana|cocaína|heroína|Drogen|Kokain|Heroin|droga|eroina)\b/iu',
        // Arabic: مخدرات (drugs), حشيش (hashish), كوكايين (cocaine), هيروين (heroin)
        '/\b(مخدرات|حشيش|كوكايين|هيروين|أفيون|مخدر)\b/u',
        // Urdu: منشیات (drugs), چرس (hashish), کوکین (cocaine), ہیروئن (heroin)
        '/\b(منشیات|چرس|کوکین|ہیروئن|افیون)\b/u',
        
        // ========== ADULT/SEXUAL CONTENT ==========
        // English, French, Spanish, German, Italian
        '/\b(p[o0]rn[o]?|escort[s]?|hooker[s]?|prostitut(ion|e[s]?)|érotique|xxx|adult\s*content|sex\s*work)\b/iu',
        '/\b(prost[ií]tut[ao]|prostitución|Prostitution|prostituzione)\b/iu',
        // Arabic: دعارة (prostitution), محتوى إباحي (porn content)
        '/\b(دعارة|محتوى\s*إباحي|إباحي|جنس)\b/u',
        // Urdu: فحاشی (obscenity), جنسی (sexual)
        '/\b(فحاشی|جنسی\s*کام|عصمت\s*فروشی)\b/u',
        
        // ========== VIOLENCE & TERRORISM ==========
        // English, French, Spanish, German, Italian
        '/\b(kill|murder|bomb|terrorist|assassin[s]?|weapon[s]?|gun[s]?)\b/iu',
        '/\b(tuer|meurtre|terroriste|arme[s]?|matar|asesinar|bomba|terrorista|töten|Mord|Terrorist|Waffe|uccidere|omicidio|terrorista|arma)\b/iu',
        // Arabic: قتل (kill), إرهاب (terrorism), سلاح (weapon), قنبلة (bomb)
        '/\b(قتل|إرهاب|إرهابي|سلاح|قنبلة|اغتيال)\b/u',
        // Urdu: قتل (kill), دہشت گردی (terrorism), ہتھیار (weapon)
        '/\b(قتل|دہشت\s*گردی|ہتھیار|بم|قاتل)\b/u',
        
        // ========== ILLEGAL ACTIVITIES ==========
        // English, French, Spanish, German, Italian
        '/\b(stolen|theft|fraud|hack|scam|counterfeit|money\s*launder)\b/iu',
        '/\b(volé|vol|fraude|piratage|arnaque|robo|robar|estafa|Diebstahl|Betrug|furto|truffa)\b/iu',
        // Arabic: سرقة (theft), احتيال (fraud), اختراق (hacking)
        '/\b(سرقة|مسروق|احتيال|اختراق|نصب|تزوير)\b/u',
        // Urdu: چوری (theft), دھوکہ (fraud), ہیکنگ (hacking)
        '/\b(چوری|دھوکہ|ہیکنگ|فراڈ|جعلی)\b/u',
        
        // ========== EXTREME PROFANITY ==========
        // English, French, Spanish, German, Italian
        '/\b(fuck|assh[o0]le|bitch|bastard|dick|pussy|cunt)\b/iu',
        '/\b(connard|salope|pute|merde|puta|cabrón|hijo\s*de\s*puta|Arschloch|Scheiße|Hure|stronzo|cazzo|puttana)\b/iu',
        // Arabic: Common profanity
        '/\b(كلب|حمار|عاهرة|لعنة)\b/u',
        // Urdu: Common profanity
        '/\b(کتا|گدھا|حرامی|کمینہ)\b/u',
    ];

    /**
     * Multilingual whitelist of legitimate phrases.
     * Prevents false positives for common everyday tasks.
     */
    protected array $whitelistedPhrases = [
        // English
        'walk my dog', 'dog walking', 'pet sitting', 'feed my cat', 'clean my house',
        'grocery shopping', 'buy groceries', 'help with moving', 'garden work',
        
        // French
        'promener mon chien', 'sortir le chien', 'garde d\'animaux', 'nourrir mon chat',
        'nettoyer ma maison', 'faire les courses', 'aide au déménagement', 'jardinage',
        
        // Spanish
        'pasear mi perro', 'cuidar mascotas', 'alimentar mi gato', 'limpiar mi casa',
        'hacer compras', 'ayuda con mudanza', 'trabajo de jardín',
        
        // German
        'hund spazieren', 'haustierbetreuung', 'katze füttern', 'haus putzen',
        'einkaufen gehen', 'umzugshilfe', 'gartenarbeit',
        
        // Arabic
        'تنظيف المنزل', 'التسوق', 'رعاية الحيوانات', 'العمل في الحديقة',
        
        // Urdu
        'گھر کی صفائی', 'خریداری', 'پالتو جانوروں کی دیکھ بھال', 'باغبانی',
    ];

    /**
     * Detect the primary language of the content.
     * Returns: 'ar' (Arabic), 'ur' (Urdu), 'en' (English), 'fr' (French), 
     *          'es' (Spanish), 'de' (German), 'it' (Italian), or 'unknown'
     */
    protected function detectLanguage(string $content): string
    {
        // Arabic script detection (U+0600 to U+06FF)
        if (preg_match('/[\x{0600}-\x{06FF}]/u', $content)) {
            // Differentiate between Arabic and Urdu by checking for Urdu-specific characters
            if (preg_match('/[\x{0679}\x{067E}\x{0686}\x{0688}\x{0691}\x{0698}\x{06A9}\x{06AF}\x{06BA}\x{06BE}\x{06C1}\x{06C3}]/u', $content)) {
                return 'ur'; // Urdu-specific characters
            }
            return 'ar'; // Arabic
        }
        
        // Common word detection for Latin-based languages
        $commonWords = [
            'fr' => ['le', 'la', 'les', 'de', 'et', 'un', 'une', 'je', 'tu', 'il', 'elle', 'nous', 'vous'],
            'es' => ['el', 'la', 'los', 'las', 'de', 'y', 'un', 'una', 'yo', 'tú', 'él', 'ella'],
            'de' => ['der', 'die', 'das', 'und', 'ich', 'du', 'er', 'sie', 'wir', 'ihr', 'ein', 'eine'],
            'it' => ['il', 'lo', 'la', 'i', 'gli', 'le', 'di', 'e', 'un', 'una', 'io', 'tu', 'lui', 'lei'],
        ];
        
        $words = preg_split('/\s+/', strtolower($content));
        $scores = ['fr' => 0, 'es' => 0, 'de' => 0, 'it' => 0];
        
        foreach ($words as $word) {
            foreach ($commonWords as $lang => $commonList) {
                if (in_array($word, $commonList)) {
                    $scores[$lang]++;
                }
            }
        }
        
        arsort($scores);
        $topLang = key($scores);
        
        // If we have a confident match (at least 2 common words), return it
        if ($scores[$topLang] >= 2) {
            return $topLang;
        }
        
        // Default to English for Latin script
        return 'en';
    }

    /**
     * Rapid check using regex. Good for real-time typing.
     * Now supports multilingual prohibited word detection.
     */
    public function isCleanFast(string $content): bool
    {
        if (empty($content)) return true;
        
        // Check whitelist first - if it matches a known legitimate phrase, allow it
        $contentLower = mb_strtolower($content, 'UTF-8');
        foreach ($this->whitelistedPhrases as $phrase) {
            if (mb_stripos($contentLower, mb_strtolower($phrase, 'UTF-8')) !== false) {
                return true;
            }
        }
        
        // Normalize content for better regex matching (strip spaces/dots/dashes between letters)
        $normalized = preg_replace('/(?<=\w)[\s\.\-\_]+(?=\w)/u', '', $content);
        
        foreach ($this->forbiddenPatterns as $pattern) {
            if (preg_match($pattern, $content) || preg_match($pattern, $normalized)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Deep check using AI with multilingual context awareness.
     * Handles double-meanings, sentences, and context across all languages.
     */
    public function isCleanAI(string $content): array
    {
        if (empty($content)) return ['is_clean' => true, 'improved_title' => null];

        // Detect language for better AI context
        $detectedLang = $this->detectLanguage($content);
        $langNames = [
            'ar' => 'Arabic',
            'ur' => 'Urdu',
            'en' => 'English',
            'fr' => 'French',
            'es' => 'Spanish',
            'de' => 'German',
            'it' => 'Italian',
            'unknown' => 'Unknown'
        ];
        $langName = $langNames[$detectedLang] ?? 'Unknown';

        $prompt = "You are a multilingual content moderator and professional editor for Oflem, a premium Swiss platform.
        Analyze this mission text for any violations (drugs, illegal services, adult content, violence, fraud, or hidden double meanings).
        
        Mission Text: \"{$content}\"
        Detected Language: {$langName}
        
        Task:
        1. Check if the content is safe and professional IN ANY LANGUAGE.
        2. If (and ONLY if) the content is clean, generate a more comprehensive, professional, and clear version of this title (max 5-8 words) IN THE SAME LANGUAGE as the input.
        3. Suggest a high-level category (e.g., Cleaning, Moving, DIY, IT, Admin, Delivery, Pets, Gardening, Events, Education, Wellness, Other).
        
        CRITICAL MULTILINGUAL GUIDELINES:
        - UNDERSTAND content in ALL languages: English, French, Arabic, Urdu, Spanish, German, Italian, etc.
        - ALLOW everyday tasks in ANY language (cleaning, shopping, pet care, moving, gardening, etc.)
        - ALLOW legal services like alcohol delivery/purchase in ANY language
        - BLOCK genuinely harmful content in ANY language: hard drugs, illegal weapons, adult services, violence, fraud
        - Be LENIENT with common everyday requests - err on the side of allowing legitimate tasks
        - Watch for bypass attempts in ANY language (symbols, spaces, numbers hiding prohibited words)
        - If the content is in Arabic, Urdu, or other non-Latin scripts, ensure you understand the context properly
        
        Return ONLY a JSON object with:
        {
          \"is_clean\": boolean,
          \"reason\": \"Brief reason if not clean, else null\",
          \"risk_level\": \"high|medium|low\",
          \"improved_title\": \"The polished, professional title IN THE SAME LANGUAGE (only if clean)\",
          \"category\": \"The suggested category\",
          \"detected_language\": \"{$langName}\"
        }";

        try {
            $result = $this->taskService->generateContent($prompt);
            
            Log::debug('AI Multilingual Moderation & Title Gen:', [
                'content' => $content,
                'detected_lang' => $langName,
                'result' => $result
            ]);
            
            return [
                'is_clean' => (bool) ($result['is_clean'] ?? false),
                'improved_title' => $result['improved_title'] ?? null,
                'category' => $result['category'] ?? 'Other',
                'reason' => $result['reason'] ?? null,
                'risk_level' => $result['risk_level'] ?? 'low',
                'detected_language' => $result['detected_language'] ?? $langName
            ];
        } catch (\Exception $e) {
            Log::error("AI Multilingual Moderation failed: " . $e->getMessage());
            
            // Fail-open strategy: Allow content but flag for manual review
            // This prevents service outages from blocking legitimate users
            return [
                'is_clean' => true, 
                'improved_title' => null,
                'needs_manual_review' => true,
                'ai_error' => true,
                'detected_language' => $langName
            ];
        }
    }

    /**
     * Get specific violation categories for flagged content.
     */
    public function getViolations(string $content): array
    {
        $violations = [];
        
        // Map pattern indices to violation categories
        $patternCategories = [
            0 => 'drugs', 1 => 'drugs', 2 => 'drugs', 3 => 'drugs',  // Drug patterns
            4 => 'adult_content', 5 => 'adult_content', 6 => 'adult_content', 7 => 'adult_content',  // Adult content
            8 => 'violence', 9 => 'violence', 10 => 'violence', 11 => 'violence',  // Violence
            12 => 'illegal_activity', 13 => 'illegal_activity', 14 => 'illegal_activity', 15 => 'illegal_activity',  // Illegal
            16 => 'profanity', 17 => 'profanity', 18 => 'profanity', 19 => 'profanity',  // Profanity
        ];

        foreach ($this->forbiddenPatterns as $index => $pattern) {
            if (preg_match($pattern, $content)) {
                $category = $patternCategories[$index] ?? 'unknown';
                if (!in_array($category, $violations)) {
                    $violations[] = $category;
                }
            }
        }

        return $violations;
    }
}
