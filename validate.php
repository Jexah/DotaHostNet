<?PHP
$failString = 'get the fuck out of here';

include_once('sql.php');
$mysqli = mysqlConnect();

// Filter for letters
if(preg_replace('/\D/', '', $_GET['steamID']) != $_GET['steamID']) {
    echo $failString;
    return;
}

// Grab vars
$steamID = $mysqli->real_escape_string($_GET['steamID']);
$token = $mysqli->real_escape_string($_GET['token']);

// Create query
$query = "SELECT avatar, personaname, profileurl FROM steamUsers NATURAL JOIN sessionKeys WHERE sessionKeys.steamID = '".$steamID."' AND token = '".$token."'";

// Run the query
$result = $mysqli->query($query);
$row = $result->fetch_row();

// Check if we found any
if($row && $_SERVER['REMOTE_ADDR'] == "127.0.0.1") {
        ?>

{
    steamID: <?PHP echo $steamID; ?>,
    avatar: "<?PHP echo $row[0]; ?>",
    personaname: "<?PHP echo addslashes($row[1]); ?>",
    profileurl: "<?PHP echo $row[2]; ?>"
}

    <?PHP
} else {
    echo $failString;
    return;
}
?>