
<?php
$content = file_get_contents('e:/Compiling Logics/Projects/Oflem/mvp-backend/lang/en.json');
$lines = explode("\n", $content);
$balance = 0;
foreach ($lines as $i => $line) {
    if (($i + 1) >= 240 && ($i + 1) <= 585) {
        $old_balance = $balance;
        $balance += substr_count($line, '{');
        $balance -= substr_count($line, '}');
        echo ($i + 1) . " [$old_balance -> $balance]: " . trim($line) . "\n";
    } else {
        $balance += substr_count($line, '{');
        $balance -= substr_count($line, '}');
    }
}
?>
