
<?php
$content = file_get_contents('e:/Compiling Logics/Projects/Oflem/mvp-backend/lang/en.json');
$lines = explode("\n", $content);
$balance = 0;
foreach ($lines as $i => $line) {
    if ($i === 0) {
        $balance += substr_count($line, '{');
        $balance -= substr_count($line, '}');
    } else {
        $balance += substr_count($line, '{');
        $balance -= substr_count($line, '}');
    }
    if ($balance === 0) {
        echo "Root bracing closed at line " . ($i + 1) . "\n";
        echo "Line content: " . $line . "\n";
        // Check if there is more content after
        if ($i < count($lines) - 1) {
            echo "STRAY CONTENT AFTER LINE " . ($i + 1) . "\n";
        }
        break;
    }
}
?>
