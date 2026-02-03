<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\ModerationService;
use App\Services\TaskProcessingService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MultilingualModerationTest extends TestCase
{
    protected $moderationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->moderationService = app(ModerationService::class);
    }

    /**
     * Test prohibited content detection in English
     */
    public function test_blocks_prohibited_content_in_english()
    {
        $prohibitedContent = [
            'I need help selling cocaine',
            'Looking for someone to buy drugs',
            'Need escort services',
            'Help me hack into a system',
            'I want to buy a stolen phone',
        ];

        foreach ($prohibitedContent as $content) {
            $result = $this->moderationService->isCleanFast($content);
            $this->assertFalse($result, "Failed to block: {$content}");
        }
    }

    /**
     * Test prohibited content detection in Arabic
     */
    public function test_blocks_prohibited_content_in_arabic()
    {
        $prohibitedContent = [
            'أحتاج مساعدة في بيع المخدرات',  // I need help selling drugs
            'أريد شراء الكوكايين',  // I want to buy cocaine
            'خدمات دعارة',  // Prostitution services
            'سرقة هاتف',  // Stolen phone
            'احتيال مالي',  // Financial fraud
        ];

        foreach ($prohibitedContent as $content) {
            $result = $this->moderationService->isCleanFast($content);
            $this->assertFalse($result, "Failed to block Arabic: {$content}");
        }
    }

    /**
     * Test prohibited content detection in Urdu
     */
    public function test_blocks_prohibited_content_in_urdu()
    {
        $prohibitedContent = [
            'منشیات فروخت کرنے میں مدد چاہیے',  // Need help selling drugs
            'کوکین خریدنا ہے',  // Want to buy cocaine
            'چوری شدہ فون',  // Stolen phone
            'فراڈ کرنا ہے',  // Want to commit fraud
        ];

        foreach ($prohibitedContent as $content) {
            $result = $this->moderationService->isCleanFast($content);
            $this->assertFalse($result, "Failed to block Urdu: {$content}");
        }
    }

    /**
     * Test prohibited content detection in Spanish
     */
    public function test_blocks_prohibited_content_in_spanish()
    {
        $prohibitedContent = [
            'Necesito ayuda vendiendo drogas',  // I need help selling drugs
            'Quiero comprar cocaína',  // I want to buy cocaine
            'Servicios de prostitución',  // Prostitution services
            'Teléfono robado',  // Stolen phone
        ];

        foreach ($prohibitedContent as $content) {
            $result = $this->moderationService->isCleanFast($content);
            $this->assertFalse($result, "Failed to block Spanish: {$content}");
        }
    }

    /**
     * Test prohibited content detection in German
     */
    public function test_blocks_prohibited_content_in_german()
    {
        $prohibitedContent = [
            'Ich brauche Hilfe beim Drogenverkauf',  // I need help selling drugs
            'Kokain kaufen',  // Buy cocaine
            'Gestohlenes Handy',  // Stolen phone
            'Betrug begehen',  // Commit fraud
        ];

        foreach ($prohibitedContent as $content) {
            $result = $this->moderationService->isCleanFast($content);
            $this->assertFalse($result, "Failed to block German: {$content}");
        }
    }

    /**
     * Test prohibited content detection in French
     */
    public function test_blocks_prohibited_content_in_french()
    {
        $prohibitedContent = [
            'J\'ai besoin d\'aide pour vendre de la drogue',  // I need help selling drugs
            'Acheter de la cocaïne',  // Buy cocaine
            'Services de prostitution',  // Prostitution services
            'Téléphone volé',  // Stolen phone
        ];

        foreach ($prohibitedContent as $content) {
            $result = $this->moderationService->isCleanFast($content);
            $this->assertFalse($result, "Failed to block French: {$content}");
        }
    }

    /**
     * Test legitimate tasks are approved in English
     */
    public function test_approves_legitimate_tasks_in_english()
    {
        $legitimateTasks = [
            'I need help cleaning my house',
            'Help me with grocery shopping',
            'Walk my dog in the park',
            'Need someone to help with moving',
            'Garden work needed',
        ];

        foreach ($legitimateTasks as $content) {
            $result = $this->moderationService->isCleanFast($content);
            $this->assertTrue($result, "Failed to approve: {$content}");
        }
    }

    /**
     * Test legitimate tasks are approved in Arabic
     */
    public function test_approves_legitimate_tasks_in_arabic()
    {
        $legitimateTasks = [
            'أحتاج مساعدة في تنظيف منزلي',  // I need help cleaning my house
            'التسوق من البقالة',  // Grocery shopping
            'رعاية الحيوانات الأليفة',  // Pet care
            'العمل في الحديقة',  // Garden work
        ];

        foreach ($legitimateTasks as $content) {
            $result = $this->moderationService->isCleanFast($content);
            $this->assertTrue($result, "Failed to approve Arabic: {$content}");
        }
    }

    /**
     * Test legitimate tasks are approved in Urdu
     */
    public function test_approves_legitimate_tasks_in_urdu()
    {
        $legitimateTasks = [
            'مجھے اپنے گھر کی صفائی میں مدد چاہیے',  // I need help cleaning my house
            'خریداری میں مدد',  // Help with shopping
            'پالتو جانوروں کی دیکھ بھال',  // Pet care
            'باغبانی کا کام',  // Garden work
        ];

        foreach ($legitimateTasks as $content) {
            $result = $this->moderationService->isCleanFast($content);
            $this->assertTrue($result, "Failed to approve Urdu: {$content}");
        }
    }

    /**
     * Test legitimate tasks are approved in Spanish
     */
    public function test_approves_legitimate_tasks_in_spanish()
    {
        $legitimateTasks = [
            'Necesito ayuda limpiando mi casa',  // I need help cleaning my house
            'Ayuda con las compras',  // Help with shopping
            'Pasear mi perro',  // Walk my dog
            'Trabajo de jardín',  // Garden work
        ];

        foreach ($legitimateTasks as $content) {
            $result = $this->moderationService->isCleanFast($content);
            $this->assertTrue($result, "Failed to approve Spanish: {$content}");
        }
    }

    /**
     * Test legitimate tasks are approved in German
     */
    public function test_approves_legitimate_tasks_in_german()
    {
        $legitimateTasks = [
            'Ich brauche Hilfe beim Hausputz',  // I need help cleaning the house
            'Hilfe beim Einkaufen',  // Help with shopping
            'Hund spazieren gehen',  // Walk the dog
            'Gartenarbeit',  // Garden work
        ];

        foreach ($legitimateTasks as $content) {
            $result = $this->moderationService->isCleanFast($content);
            $this->assertTrue($result, "Failed to approve German: {$content}");
        }
    }

    /**
     * Test legitimate tasks are approved in French
     */
    public function test_approves_legitimate_tasks_in_french()
    {
        $legitimateTasks = [
            'J\'ai besoin d\'aide pour nettoyer ma maison',  // I need help cleaning my house
            'Aide pour faire les courses',  // Help with shopping
            'Promener mon chien',  // Walk my dog
            'Travaux de jardinage',  // Garden work
        ];

        foreach ($legitimateTasks as $content) {
            $result = $this->moderationService->isCleanFast($content);
            $this->assertTrue($result, "Failed to approve French: {$content}");
        }
    }

    /**
     * Test language detection accuracy
     */
    public function test_language_detection()
    {
        $reflection = new \ReflectionClass($this->moderationService);
        $method = $reflection->getMethod('detectLanguage');
        $method->setAccessible(true);

        $testCases = [
            'I need help cleaning' => 'en',
            'J\'ai besoin d\'aide' => 'fr',
            'Necesito ayuda' => 'es',
            'Ich brauche Hilfe' => 'de',
            'أحتاج مساعدة' => 'ar',
            'مجھے مدد چاہیے' => 'ur',
        ];

        foreach ($testCases as $content => $expectedLang) {
            $detectedLang = $method->invoke($this->moderationService, $content);
            $this->assertEquals($expectedLang, $detectedLang, "Failed to detect language for: {$content}");
        }
    }
}
