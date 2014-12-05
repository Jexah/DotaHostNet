<script>
<?php
	include_once('sql.php');
	require ('steamauth/steamauth.php');
	$loggedIn = isset($_SESSION['steamid']);
	if($loggedIn){
		include ('steamauth/userInfo.php');
?>
	var user = {
		steamid: <?php echo($steamprofile['steamid32']); ?>,
		communityvisibilitystate: <?php echo($steamprofile['communityvisibilitystate']); ?>,
		profilestate: <?php echo($steamprofile['profilestate']); ?>,
		personaname: <?php echo('"' . addslashes($steamprofile['personaname']) . '"'); ?>,
		lastlogoff: <?php echo($steamprofile['lastlogoff']); ?>,
		profileurl: <?php echo('"' . $steamprofile['profileurl'] . '"'); ?>,
		avatar: <?php echo('"' . $steamprofile['avatar'] . '"'); ?>,
		avatarmedium: <?php echo('"' . $steamprofile['avatarmedium'] . '"'); ?>,
		avatarfull: <?php echo('"' . $steamprofile['avatarfull'] . '"'); ?>,
		personastate: <?php echo($steamprofile['personastate']); ?>,
		primaryclanid: <?php echo($steamprofile['primaryclanid']); ?>,
		timecreated: <?php echo($steamprofile['timecreated']); ?>,
		token: <?php echo('"' . $steamprofile['token'] . '"'); ?>,
	};
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
	var managerVersion = "<?php echo(file_get_contents('version.txt')); ?>";
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