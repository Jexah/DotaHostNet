<?PHP
// Converts a steamID between 64 and 32 bit formats
function convert_id($id) {
    if (strlen($id) === 17) {
        $converted = substr($id, 3) - 61197960265728;
    } else {
        $converted = '765'.($id + 61197960265728);
    }
    return (string) $converted;
}

// Generates a new token for a user
function generateToken() {
    // Ensure connected
    $mysqli = mysqlConnect();

    // Grab vars
    $steamID = $mysqli->real_escape_string(convert_id($_SESSION['steam_steamid']));
    $avatar = $mysqli->real_escape_string($_SESSION['steam_avatar']);
    $personaname = $mysqli->real_escape_string($_SESSION['steam_personaname']);
    $profileurl = $mysqli->real_escape_string($_SESSION['steam_profileurl']);

    // Build query
    $query = "REPLACE INTO steamUsers
        (steamID, avatar, personaname, profileurl) VALUES
        (".$steamID.", '".$avatar."', '".$personaname."', '".$profileurl."')";

    // Run query
    if($mysqli->query($query)) {
        // Generate a token
        $token = md5(uniqid());
        $safeToken = $mysqli->real_escape_string($token);

        // Build token store
        $query = "REPLACE INTO sessionKeys
            (steamID, token) VALUES
            ('".$steamID."', '".$safeToken."')";

        // Run token store
        if($mysqli->query($query)) {
            // Store token
            $_SESSION['steam_token'] = $token;

            return $token;
        } else {
            echo "Failed to store user token.";
            exit(1);
            return;
        }

    } else {
        echo "Failed to add user into DB.";
        exit(1);
        return;
    }
}
?>
