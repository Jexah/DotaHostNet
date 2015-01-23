<?php
	if(file_exists('maintenance.php') && $_SERVER['REMOTE_ADDR'] != '***REMOVED***') {
		header("Location: http://$_SERVER[HTTP_HOST]/maintenance.php");
		die();
	}
?>

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
		personaname: <?php echo('"' . addslashes($steamprofile['personaname']) . '"'); ?>,
		profileurl: <?php echo('"' . $steamprofile['profileurl'] . '"'); ?>,
		avatar: <?php echo('"' . $steamprofile['avatar'] . '"'); ?>,
		avatarmedium: <?php echo('"' . $steamprofile['avatarmedium'] . '"'); ?>,
		avatarfull: <?php echo('"' . $steamprofile['avatarfull'] . '"'); ?>,
		personastate: <?php echo($steamprofile['personastate']); ?>,
		token: <?php echo('"' . $steamprofile['token'] . '"'); ?>,
		badges: <?php echo($steamprofile['badges']); ?>,
		cosmetics: <?php echo($steamprofile['cosmetics']); ?>,
		beta: <?php echo(var_export($steamprofile['beta'])); ?>

		<?php
			// Check bans
			if(isset($_SESSION['steam_banexpiration'])) {
				// Grab the time info
				$time = strtotime($_SESSION['steam_banexpiration']);
				$curtime = time();

				// Check if the ban has expired
				if($curtime > $time) {
		            // Delete the ban info
		            unset($_SESSION['steam_bansteamid']);
			        unset($_SESSION['steam_banexpiration']);
			        unset($_SESSION['steam_banreason']);
			    } else {
			    	// User is banned, add banned info
			    	echo 'banreason: "'.addslashes($_SESSION['steam_banreason']).'",'."\r\n";
			    	echo "\t\t".'banexpiration: "'.addslashes($_SESSION['steam_banexpiration']).'",'."\r\n";
			    }
			}
		?>
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

	// Grab the manager version info
	$managerVersion = 'UNKNOWN VERSION';
	if(file_exists('addons\\DotaHostManager.txt')) {
		$managerVersion = file('addons\\DotaHostManager.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES)[0];
	}
?>
	var managerVersion = "<?php echo($managerVersion); ?>";
</script>

<!DOCTYPE html>
<html lang="en">
	<head>
		<!-- Latest compiled and minified CSS -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">

		<link rel="stylesheet" href="main.css">

		<title>DotaHost.Net</title>
		
	</head>
	<body>
		<div id="settings" class="modal fade">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						<h4 class="modal-title">DotaHost Settings</h4>
					</div>
					<div id="settingsBody" class="modal-body">
						Please open the ModManager.
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
					</div>
				</div>
			</div>
		</div>
		<div id="createLobbyOptions" class="modal fade">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						<h4 class="modal-title">Create Lobby</h4>
					</div>
					<div id="createLobbyBody" class="modal-body">
					</div>
					<div class="modal-footer">
						<button id="createLobbyOptionsCreate" type="button" class="btn btn-primary">Create</button>
					</div>
				</div>
			</div>
		</div>
		<div id="main" class="container-fluid"></div>
		<iframe id="go" style="display:none"></iframe>

		<script>alert('wtf');</script>

		<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
		<!-- Latest compiled and minified JavaScript -->
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>

		<script src="templates/addon.js"></script>
		<script src="templates/addonStatus.js"></script>
		<script src="templates/chat.js"></script>
		<script src="templates/cosmetics.js"></script>

		<script src="templates/helpers.js"></script>

		<script src="templates/invalid.js"></script>

		<script src="templates/lobbies.js"></script>


		<script src="templates/lobby.js"></script>
		<script src="templates/lobbyButtons.js"></script>

		<script src="templates/player.js"></script>
		<script src="templates/ready.js"></script>

		<script src="templates/spinner.js"></script>
		<script src="templates/team.js"></script>
		<script src="templates/wsdivs.js"></script>

		<script src="templates/landing.js"></script>

		<script src="main.js"></script>


		<audio id="readyAudio" src="ready.wav" preload="auto" volume="1.0"></audio>
	</body>
</html>