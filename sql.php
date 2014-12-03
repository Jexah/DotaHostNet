<?php
// It is seperated like this because we rarely use MYSQL, so only make a connection if needed!

$mysqli = null;

// Ensures mysql is connected properly
function mysqlConnect() {
    // Use global mysqli
    global $mysqli;

    // MYSQL Settings
    $dbhost = '127.0.0.1:3306';
    $dbuser = 'root';
    $dbpass = '***REMOVED***';
    $dbname = 'dotahost';

    if($mysqli == null) {
        // Attempt to conect
        $mysqli = mysqli_connect($dbhost, $dbuser, $dbpass, $dbname) or die('Failed to connect to mysql.');
    }

    return $mysqli;
}
?>
