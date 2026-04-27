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

        // ========== ALCOHOL, TOBACCO & VAPING ==========
        '/\b(alcohol|beer|wine|vodka|whiskey|rum|spirit[s]?|liquor|tobacco|cig[ae]r[e]?s?|cigarette[s]?|vape|vaping|e-cig)\b/iu',
        '/\b(alcool|bière|vin|vodka|whisky|rhum|spiritueux|tabac|cigare[s]?|cigarette[s]?|vapoteuse|vapotage)\b/iu',

        // ========== WEAPONS & DANGEROUS ITEMS ==========
        '/\b(weapon[s]?|gun[s]?|pistol[s]?|rifle[s]?|knife|knives|ammunition|ammo|explosive[s]?|bomb[s]?|grenade[s]?)\b/iu',
        '/\b(arme[s]?|fusil[s]?|pistolet[s]?|couteau|couteaux|munitions|explosif[s]?|bombe[s]?|grenade[s]?)\b/iu',

        // ========== MEDICAL & REGULATED SERVICES ==========
        '/\b(prescription[s]?|medicine[s]?|medical\s*advice|prescribe|pharmacy|pharmacie|ordonnance|médicament[s]?|docteur|doctor)\b/iu',

        // ========== OFF-PLATFORM CONTACT (bypass attempts) ==========
        // Messaging apps — catches leetspeak/normalized forms e.g. "wh4tsapp", "t3legram"
        '/\b(whatsapp|whats\s*app|telegram|signal|viber|snapchat|discord|wechat|we\s*chat|line\s*app)\b/iu',
        // Generic contact-request phrases
        '/\b(call\s+me\s+(at|on)|text\s+me\s+(at|on|via)|dm\s+me|message\s+me\s+(at|on)|my\s+(phone|number|cell|mobile)\s+is|find\s+me\s+on|contact\s+me\s+(at|on|via|outside))\b/iu',

        // ========== OFF-PLATFORM PAYMENT (bypass attempts) ==========
        '/\b(paypal|pay\s*pal|venmo|cashapp|cash\s*app|zelle|wire\s*transfer|bank\s*transfer|iban|swift\s*code|bitcoin|btc|ethereum|eth|crypto|cryptocurrency)\b/iu',
        // Payment-outside-platform phrases
        '/\b(pay\s+(me|you|us)\s+(directly|outside|cash|via)|cash\s+(only|payment|deal)|off[\s\-]?platform)\b/iu',
    ];

    // Whitelist removed: it was a bypass vector. A phrase like "walk my dog buy cocaine"
    // matched "walk my dog" and returned true before forbidden patterns were checked.
    // The legitimate phrases in the old whitelist don't overlap with any forbidden pattern,
    // so removing the early-return does not cause false positives.

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
            'it' => ['il', 'lo', 'la', 'gli', 'le', 'di', 'e', 'un', 'una', 'io', 'tu', 'lui', 'lei'],
            'en' => ['the', 'is', 'at', 'which', 'on', 'and', 'for', 'with', 'that', 'this', 'it', 'me', 'my'],
        ];
        
        $words = preg_split('/\s+/', strtolower($content));
        $scores = ['fr' => 0, 'es' => 0, 'de' => 0, 'it' => 0, 'en' => 0];
        
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
     * Normalize text to defeat obfuscation: zero-width chars, unicode homoglyphs,
     * leetspeak substitution (0→o, 3→e, 4→a, …), and spaced/dotted letters (w h a t s a p p).
     *
     * Applied before pattern matching so "wh4ts4pp", "t.e.l.e.g.r.a.m", and
     * "ƒuck" are all caught by the same regex as their plain forms.
     */
    protected function normalize(string $content): string
    {
        // 1. Strip zero-width and invisible Unicode chars that hide words from pattern matching.
        $content = preg_replace('/[\x{200B}-\x{200D}\x{FEFF}\x{00AD}\x{2060}]/u', '', $content);

        // 2. NFKC normalization: collapses compatibility variants (e.g. ＷｈａｔｓＡｐｐ → WhatsApp,
        //    cursive/script Unicode letters → ASCII equivalents where possible).
        if (function_exists('normalizer_normalize')) {
            $content = normalizer_normalize($content, \Normalizer::NFKC) ?: $content;
        }

        // 3. Collapse single separator characters between letters: "w h a t s" → "whats",
        //    "t.e.l.e.g.r.a.m" → "telegram". Only strips isolated separators (one char wide).
        $content = preg_replace('/(?<=\w)([\s\.\-\_\*](?=\w))+/u', '', $content);

        // 4. Leetspeak substitution — map common digit/symbol substitutions back to letters.
        $leet = [
            '0' => 'o', '1' => 'i', '3' => 'e', '4' => 'a',
            '5' => 's', '6' => 'g', '7' => 't', '8' => 'b',
            '@' => 'a', '$' => 's', '!' => 'i', '+' => 't',
        ];
        $content = strtr($content, $leet);

        return $content;
    }

    /**
     * Rapid check using regex. Good for real-time typing.
     * Runs patterns against BOTH the original and normalized content so obfuscated
     * variants (spaces, dots, leetspeak, unicode) cannot bypass the filters.
     */
    public function isCleanFast(string $content): bool
    {
        if (empty($content)) return true;

        $normalized = $this->normalize($content);

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

        // Hard cap: only send the first 600 chars to the AI to control token cost.
        // Moderation decisions are reliable on a short excerpt; long inputs waste quota.
        $content = mb_substr($content, 0, 600, 'UTF-8');

        // Strip characters that could allow prompt injection through the interpolated string.
        $content = str_replace(['"', '\\'], ['', ''], $content);

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
        - BLOCK STAY-SAFE VIOLATIONS: hard drugs, weapons, adult services, violence, fraud
        - BLOCK REGULATED GOODS: alcohol delivery/purchase, tobacco, vaping products
        - BLOCK PROFESSIONAL SERVICES: medical advice, legal advice, prescription fulfillment
        - Be LENIENT with common everyday requests (cleaning, DIY, gardening) - err on the side of allowing legitimate tasks
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
            // Short TTL (5 min) — moderation results should not be cached long.
            // A banned phrase could get a stale "is_clean: true" for hours with the default 1h TTL.
            $result = $this->taskService->generateContent($prompt, cacheTtlSeconds: 300);
            
            Log::debug('AI Multilingual Moderation & Title Gen:', [
                'content' => $content,
                'detected_lang' => $langName,
                'result' => $result
            ]);

            // Fail-open on technical error: if AI is down, we trust isCleanFast (regex) 
            // and allow the content to prevent blocking legitimate users.
            if (empty($result)) {
                Log::warning('AI Moderation empty response — failing open', ['content' => $content]);
                return [
                    'is_clean' => true,
                    'improved_title' => null,
                    'category' => 'Other',
                    'reason' => null,
                    'risk_level' => 'low',
                    'detected_language' => $langName
                ];
            }

            // Strict schema validation: is_clean must be a boolean (not a string "true").
            // A missing or non-boolean value is treated as false (fail-closed).
            $isClean = isset($result['is_clean']) && is_bool($result['is_clean'])
                ? $result['is_clean']
                : false;

            return [
                'is_clean' => $isClean,
                'improved_title' => $result['improved_title'] ?? null,
                'category' => $result['category'] ?? 'Other',
                'reason' => $result['reason'] ?? null,
                'risk_level' => $result['risk_level'] ?? 'low',
                'detected_language' => $result['detected_language'] ?? $langName
            ];
        } catch (\Exception $e) {
            Log::error("AI Multilingual Moderation failed: " . $e->getMessage());
            
            // Fail-open: allow content on exception but log it.
            return [
                'is_clean' => true,
                'improved_title' => null,
                'category' => 'Other',
                'reason' => null,
                'risk_level' => 'low',
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
            20 => 'off_platform_contact', 21 => 'off_platform_contact',  // Messaging platforms + contact phrases
            22 => 'off_platform_payment', 23 => 'off_platform_payment',  // Payment methods + payment phrases
        ];

        $normalized = $this->normalize($content);

        foreach ($this->forbiddenPatterns as $index => $pattern) {
            if (preg_match($pattern, $content) || preg_match($pattern, $normalized)) {
                $category = $patternCategories[$index] ?? 'unknown';
                if (!in_array($category, $violations)) {
                    $violations[] = $category;
                }
            }
        }

        return $violations;
    }
}
