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

    function updateToken($mysqli, $steamID) {
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
    }

    // Check if they have any bans on record
    $query = "SELECT expiration, reason FROM bans WHERE steamID=".$steamID." AND NOW() < expiration LIMIT 1;";
    if($result = $mysqli->query($query)) {
        // Does this user have a ban?
        if($result->num_rows > 0) {
            // Pull the first ban only
            $row = $result->fetch_row();

            // Store ban stuff
            $_SESSION['steam_bansteamid'] = $_SESSION['steam_steamid'];
            $_SESSION['steam_banexpiration'] = $row[0];
            $_SESSION['steam_banreason'] = $row[1];
        }
    } else {
        echo "Failed to check bans.";
        exit(1);
        return;
    }

    // Check if the account already exists
    $query = "SELECT avatar, personaname, profileurl, badges, cosmetics FROM steamUsers WHERE steamID=".$steamID.";";
    if($result = $mysqli->query($query)) {
        // Does this user already exist?
        if($result->num_rows <= 0) {
            // User does NOT exist
            $query = "INSERT INTO steamUsers
                (steamID, avatar, personaname, profileurl, badges, cosmetics) VALUES
                (".$steamID.", '".$avatar."', '".$personaname."', '".$profileurl."', 0, 0)";

            // Store badge stuff
            $_SESSION['steam_badges'] = 0;
            $_SESSION['steam_cosmetics'] = 0;

            // Run the query
            if($mysqli->query($query)) {
                return updateToken($mysqli, $steamID);
            } else {
                echo "Failed to store user!";
                exit(1);
                return;
            }
        } else {
            // User exists, grab data
            $row = $result->fetch_row();

            // Update their fields
            $query = "UPDATE steamUsers SET avatar='".$avatar."', personaname='".$personaname."', profileurl='".$profileurl."' WHERE steamID=".$steamID;

            // Store badge stuff
            $_SESSION['steam_badges'] = $row[3];
            $_SESSION['steam_cosmetics'] = $row[4];

            // Run the query
            if($mysqli->query($query)) {
                return updateToken($mysqli, $steamID);
            } else {
                echo "Failed to update user!";
                exit(1);
                return;
            }
        }
    }
}
?>
