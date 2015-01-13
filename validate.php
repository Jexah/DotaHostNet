<?PHP
    $failString = 'get the fuck out of here';
    if($_SERVER['REMOTE_ADDR'] != "127.0.0.1")
    {
        echo($failString);
        return;
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
            $whitelist = json_decode(file_get_contents('beta/whitelist.json'));
            $whitelisted = $whitelist != NULL && isset($whitelist->$steamID);

            // Check if the user is white listed
            if($whitelisted) {
                // Check bans
                $query = "SELECT expiration, reason FROM bans WHERE steamID=".$steamID." AND NOW() < expiration LIMIT 1;";
                if($result = $mysqli->query($query)) {
                    // Does this user have a ban?
                    if($result->num_rows > 0) {
                        // User is banned, dont allow them in!
                        echo $failString;
                        return;
                    } else {
                        // User is not banned, allow them <3
                        echo '{"0":"'.$steamID.'","1":"'.addslashes($row[1]).'","2":"'.$row[0].'","3":"'.$row[2].'","4":"'.$row[3].'","5":"'.$row[4].'"}';
                        return;
                    }
                } else {
                    // Failed to run ban checking query
                    echo $failString;
                    return;
                }
            } else {
                echo $failString;
                return;
            }
        } else {
            echo $failString;
            return;
        }
    }
?>