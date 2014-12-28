<?PHP
    // Check if the user is logged in
    require ('steamauth/steamauth.php');
    $loggedIn = isset($_SESSION['steamid']);
    if($loggedIn){
        // Grab their userinfo
        include ('steamauth/userInfo.php');

        // Ensure connected to mysql
        include_once('sql.php');
        $mysqli = mysqlConnect();

        // Grab vars
        $steamID = $mysqli->real_escape_string(convert_id($_SESSION['steam_steamid']));

        // Build Query
        $query = "DELETE FROM sessionKeys WHERE steamID='".$steamID."';";

        // Ensure success
        if(!$mysqli->query($query)) {
            echo "Failed to logout!";
            exit(1);
            return;
        }

        // Remove session stuff
        unset($_SESSION['steamid']);
        unset($_SESSION['steam_uptodate']);
    }

    // Redirect to the root
    header("Location: ./");
?>
