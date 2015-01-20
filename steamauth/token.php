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
        // Check if they are a beta user
        if(!$_SESSION['steam_beta']) {
            // Not a beta user

            // Check if there are any free beta slots
            try {
                // Begin Transaction
                $mysqli->autocommit(FALSE);

                // Pull number of free slots
                if($result = $mysqli->query('SELECT slots from betaSlots WHERE lck = 0 LIMIT 1;')) {
                    if($result->num_rows > 0) {
                        // Grab data
                        $row = $result->fetch_row();
                        $slotsLeft = $row[0];

                        // Check if we have any slots left
                        if($slotsLeft > 0) {
                            // Lower slot count
                            $slotsLeft -= 1;

                            // Update slots count
                            if($mysqli->query("UPDATE betaSlots SET slots=".$slotsLeft." WHERE lck = 0;")) {
                                // Store user as a beta user
                                if($mysqli->query("INSERT INTO betaUsers (steamID) VALUES (".$steamID.");")) {
                                    // All is good, commit
                                    $mysqli->commit();

                                    // Store us as a beta user
                                    $_SESSION['steam_beta'] = true;
                                } else {
                                    // Failure, rollback
                                    $mysqli->rollback();
                                }
                            } else {
                                // Failure, rollback
                                $mysqli->rollback();
                            }
                        }
                    }
                }
            } catch (Exception $e) {
                // An exception has been thrown
                // We must rollback the transaction
                $mysqli->rollback();
            } finally {
                // End Transaction
                $mysqli->autocommit(TRUE);
            }
        }

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
    $query = "SELECT expiration, reason FROM bans WHERE steamID=".$steamID." AND NOW() < expiration ORDER BY expiration DESC LIMIT 1;";
    if($result = $mysqli->query($query)) {
        // Does this user have a ban?
        if($result->num_rows > 0) {
            // Pull the first ban only
            $row = $result->fetch_row();

            // Store ban stuff
            $_SESSION['steam_bansteamid'] = $_SESSION['steam_steamid'];
            $_SESSION['steam_banexpiration'] = $row[0];
            $_SESSION['steam_banreason'] = $row[1];
        } else {
            // User shouldn't be banned, check for remaining ban stuff
            if(isset($_SESSION['steam_banexpiration'])) {
                if($_SESSION['steam_bansteamid'] != $_SESSION['steam_steamid']) {
                    // Alt account! Lets copy the ban across
                    $query = "INSERT INTO bans (steamID, expiration, reason) VALUES (".$steamID.", '".$mysqli->real_escape_string($_SESSION['steam_banexpiration'])."', '".$mysqli->real_escape_string($_SESSION['steam_banreason'])."');";

                    // Run the query
                    if(!$mysqli->query($query)) {
                        echo "Failed to update bans.";
                        exit(1);
                        return;
                    }
                } else {
                    // User should be unbanned, remove remaining stuff
                    unset($_SESSION['steam_bansteamid']);
                    unset($_SESSION['steam_banexpiration']);
                    unset($_SESSION['steam_banreason']);
                }
            }
        }
    } else {
        echo "Failed to check bans.";
        exit(1);
        return;
    }

    // Check if the account already exists
    $query = "SELECT avatar, personaname, profileurl, badges, cosmetics, betaUsers.steamID as beta FROM steamUsers LEFT JOIN betaUsers ON steamUsers.steamID=betaUsers.steamID WHERE steamUsers.steamID=".$steamID.";";
    if($result = $mysqli->query($query)) {
        // Does this user already exist?
        if($result->num_rows <= 0) {
            // User does NOT exist
            $query = "INSERT INTO steamUsers
                (steamID, avatar, personaname, profileurl, badges, cosmetics) VALUES
                (".$steamID.", '".$avatar."', '".$personaname."', '".$profileurl."', 0, 0);";

            // Store badge stuff
            $_SESSION['steam_badges'] = 0;
            $_SESSION['steam_cosmetics'] = 0;
            $_SESSION['steam_beta'] = false;

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

            // Store badge stuff
            $_SESSION['steam_badges'] = $row[3];
            $_SESSION['steam_cosmetics'] = $row[4];

            // Store beta flag
            if(is_null($row[5])) {
                // Not a beta user
                $_SESSION['steam_beta'] = false;
            } else {
                // They are a beta user
                $_SESSION['steam_beta'] = true;
            }

            // Update their fields
            $query = "UPDATE steamUsers SET avatar='".$avatar."', personaname='".$personaname."', profileurl='".$profileurl."' WHERE steamID=".$steamID;

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
