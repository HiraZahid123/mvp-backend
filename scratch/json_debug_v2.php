
<?php
$content = file_get_contents('e:/Compiling Logics/Projects/Oflem/mvp-backend/lang/en.json');
json_decode($content);
switch (json_last_error()) {
    case JSON_ERROR_NONE:
        echo "Valid JSON\n";
        break;
    default:
        $error = json_last_error_msg();
        echo "Error: $error\n";
        // Attempt to find the position
        for ($i = 1; $i <= strlen($content); $i++) {
            $sub = substr($content, 0, $i);
            json_decode($sub);
            if (json_last_error() !== JSON_ERROR_NONE && json_last_error() !== JSON_ERROR_STATE_MISMATCH) {
                echo "Syntax error around character $i\n";
                echo "Context: " . substr($content, max(0, $i - 20), 40) . "\n";
                break;
            }
        }
        break;
}
?>
