
<?php
$content = file_get_contents('e:/Compiling Logics/Projects/Oflem/mvp-backend/lang/en.json');
$lines = explode("\n", $content);
$current = '';
foreach ($lines as $i => $line) {
    $current .= $line . "\n";
    json_decode($current);
    if (json_last_error() !== JSON_ERROR_NONE && json_last_error() !== JSON_ERROR_STATE_MISMATCH) {
        // STATE_MISMATCH happens when it's incomplete.
        // We want to find the first line that makes it genuinely "Invalid" beyond just "Incomplete".
        // Actually, JSON is only valid when finished.
    }
}

// Better way: binary search or just check the whole thing and look for common errors.
echo "Full length: " . strlen($content) . "\n";
json_decode($content);
echo "Error: " . json_last_error_msg() . "\n";
?>
