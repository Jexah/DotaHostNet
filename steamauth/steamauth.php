<?php
ob_start();
session_start();
require ('openid.php');

function logoutbutton() {
    echo "<form action=\"steamauth/logout.php\" method=\"post\"><input value=\"Logout\" type=\"submit\" /></form>"; //logout button
}

function steamlogin(){
	try {
		require("settings.php");
	    $openid = new LightOpenID($domainname);
	    
	    if(!$openid->mode) {
	        if(isset($_GET['login'])) {
	            $openid->identity = 'http://steamcommunity.com/openid';
	            header('Location: ' . $openid->authUrl());
	        }
	    }elseif($openid->mode == 'cancel') {
			//echo 'User has canceled authentication!';
	    } else {
	        if($openid->validate()) { 
				$id = $openid->identity;
				$ptn = "/^http:\/\/steamcommunity\.com\/openid\/id\/(7[0-9]{15,25}+)$/";
				preg_match($ptn, $id, $matches);

				session_start();
				$_SESSION['steamid'] = $matches[1]; 

				header('Location: '.$_SERVER['REQUEST_URI']);

	        } else {
				//echo "User is not logged in.\n";
	        }
	    }
	} catch(ErrorException $e) {
	    echo $e->getMessage();
	}
}

?>
