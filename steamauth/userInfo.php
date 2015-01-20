<?php
    // Do token generation
    require_once('token.php');

	include("settings.php");
    if (empty($_SESSION['steam_uptodate']) or $_SESSION['steam_uptodate'] == false or empty($_SESSION['steam_personaname'])) {
        $url = file_get_contents("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=".$api_key."&steamids=".$_SESSION['steamid']);
        $content = json_decode($url, true);
        $_SESSION['steam_steamid'] = $content['response']['players'][0]['steamid'];
        $_SESSION['steam_communityvisibilitystate'] = $content['response']['players'][0]['communityvisibilitystate'];
        $_SESSION['steam_profilestate'] = $content['response']['players'][0]['profilestate'];
        $_SESSION['steam_personaname'] = $content['response']['players'][0]['personaname'];
        $_SESSION['steam_lastlogoff'] = $content['response']['players'][0]['lastlogoff'];
        $_SESSION['steam_profileurl'] = $content['response']['players'][0]['profileurl'];
        $_SESSION['steam_avatar'] = $content['response']['players'][0]['avatar'];
        $_SESSION['steam_avatarmedium'] = $content['response']['players'][0]['avatarmedium'];
        $_SESSION['steam_avatarfull'] = $content['response']['players'][0]['avatarfull'];
        $_SESSION['steam_personastate'] = $content['response']['players'][0]['personastate'];
        $_SESSION['steam_primaryclanid'] = $content['response']['players'][0]['primaryclanid'];
        $_SESSION['steam_timecreated'] = $content['response']['players'][0]['timecreated'];
        $_SESSION['steam_uptodate'] = true;

        // Generate a new token
        generateToken();
    }

    // Check if we have a token
    if(empty($_SESSION['steam_token'])) {
        // Generate the token
        generateToken();
    }

    // Ensure they have a key to give the webserver


    $steamprofile['steamid'] = $_SESSION['steam_steamid'];
    $steamprofile['steamid32'] = convert_id($_SESSION['steam_steamid']);
    $steamprofile['communityvisibilitystate'] = $_SESSION['steam_communityvisibilitystate'];
    $steamprofile['profilestate'] = $_SESSION['steam_profilestate'];
    $steamprofile['personaname'] = $_SESSION['steam_personaname'];
    $steamprofile['lastlogoff'] = $_SESSION['steam_lastlogoff'];
    $steamprofile['profileurl'] = $_SESSION['steam_profileurl'];
    $steamprofile['avatar'] = $_SESSION['steam_avatar'];
    $steamprofile['avatarmedium'] = $_SESSION['steam_avatarmedium'];
    $steamprofile['avatarfull'] = $_SESSION['steam_avatarfull'];
    $steamprofile['personastate'] = $_SESSION['steam_personastate'];
    $steamprofile['primaryclanid'] = $_SESSION['steam_primaryclanid'];
    $steamprofile['timecreated'] = $_SESSION['steam_timecreated'];
    $steamprofile['token'] = $_SESSION['steam_token'];
    $steamprofile['badges'] = $_SESSION['steam_badges'];
    $steamprofile['cosmetics'] = $_SESSION['steam_cosmetics'];
    $steamprofile['beta'] = $_SESSION['steam_beta'];
?>

