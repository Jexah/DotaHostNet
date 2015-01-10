<?PHP
    $failString = 'get the fuck out of here';
    if($_SERVER['REMOTE_ADDR'] != "127.0.0.1")
    {
        echo($failString);
    }
    else
    {
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
        $query = "SELECT avatar, personaname, profileurl, badges, cosmetics FROM steamUsers NATURAL JOIN sessionKeys WHERE sessionKeys.steamID = '".$steamID."' AND token = '".$token."'";

        // Run the query
        $result = $mysqli->query($query);
        $row = $result->fetch_row();

        // Check if we found any
        if($row) {
            // Grab the whitelist
            $whitelist = json_decode(file_get_contents('beta/whitelist.json') || '{}');

?>{"0":"<?PHP echo $steamID; ?>","1":"<?PHP echo addslashes($row[1]); ?>","2":"<?PHP echo $row[0]; ?>","3":"<?PHP echo $row[2]; ?>","4":"<?PHP echo $row[3]; ?>","5":"<?PHP echo $row[4]; ?>","6":"<?PHP echo($whitelist != NULL && property_exists($whitelist, $steamprofile['steamid32']) ? '1' : '0') ?>"}<?PHP
        } else {
            echo $failString;
            return;
        }
    }
?>