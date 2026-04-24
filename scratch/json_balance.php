
<?php
$content = file_get_contents('e:/Compiling Logics/Projects/Oflem/mvp-backend/lang/en.json');
$open = substr_count($content, '{');
$close = substr_count($content, '}');
$o_sq = substr_count($content, '[');
$c_sq = substr_count($content, ']');
echo "Braces: Open=$open, Close=$close\n";
echo "Brackets: Open=$o_sq, Close=$c_sq\n";

if ($open !== $close) {
    echo "IMBALANCE DETECTED\n";
    // Find where the imbalance starts
    $balance = 0;
    $lines = explode("\n", $content);
    foreach ($lines as $i => $line) {
        $balance += substr_count($line, '{');
        $balance -= substr_count($line, '}');
        if ($balance < 0) {
            echo "Balance dropped below zero at line " . ($i + 1) . "\n";
            echo "Line: " . $line . "\n";
            break;
        }
    }
}
?>
