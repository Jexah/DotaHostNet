<script>
	var spinner = '<div class="spinner"><div class="spinner-container container1"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div><div class="spinner-container container2"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div><div class="spinner-container container3"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div></div>';
<?php
	require ('steamauth/steamauth.php');  

	$loggedIn = isset($_SESSION['steamid']);
	if($loggedIn){
		include ('steamauth/userInfo.php');
?>		
	var user = {};
	user['steamid'] = <?php echo($steamprofile['steamid']); ?>;
	user['communityvisibilitystate'] = <?php echo($steamprofile['communityvisibilitystate']); ?>;
	user['profilestate'] = <?php echo($steamprofile['profilestate']); ?>;
	user['personaname'] = <?php echo('"' . $steamprofile['personaname'] . '"'); ?>;
	user['lastlogoff'] = <?php echo($steamprofile['lastlogoff']); ?>;
	user['profileurl'] = <?php echo('"' . $steamprofile['profileurl'] . '"'); ?>;
	user['avatar'] = <?php echo('"' . $steamprofile['avatar'] . '"'); ?>;
	user['avatarmedium'] = <?php echo('"' . $steamprofile['avatarmedium'] . '"'); ?>;
	user['avatarfull'] = <?php echo('"' . $steamprofile['avatarfull'] . '"'); ?>;
	user['personastate'] = <?php echo($steamprofile['personastate']); ?>;
	user['primaryclanid'] = <?php echo($steamprofile['primaryclanid']); ?>;
	user['timecreated'] = <?php echo($steamprofile['timecreated']); ?>;
<?php
	} else {
?>
		var user = null;
<?php
	}

	# You would uncomment the line beneath to make it refresh the data every time the page is loaded
	//$_SESSION['steam_uptodate'] = false;
	steamLogin();
?>
</script>

<!DOCTYPE html>
<html lang="en">
	<head>
		<!-- Latest compiled and minified CSS -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">

		<!-- Optional theme -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">

		<link rel="stylesheet" href="main.css">

		<title>DotaHost.Net</title>
	</head>
	<body>
		<div id="main" class="container">
			
		</div>

		<script>
			if(user != null){
				history.pushState({}, "", "/");
			}
		</script>
		<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
		<!-- Latest compiled and minified JavaScript -->
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
		<script src="main.js"></script>
	</body>
</html>