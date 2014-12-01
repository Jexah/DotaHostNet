<?php
	require ('steamauth/steamauth.php');  

	$loggedIn = isset($_SESSION['steamid']);
	if($loggedIn){
		include ('steamauth/userInfo.php');
	}

	# You would uncomment the line beneath to make it refresh the data every time the page is loaded
	//$_SESSION['steam_uptodate'] = false;
?>
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
		<div class="container">

			<div class="row" style="height:200px;">
			</div>
			<div class="row" style="height:100px;">
				<div class="col-md-3"></div>
				<div class="col-md-6">
					<span style="text-align:center;">
						<?php
							if($loggedIn) {
						?>
								<h1>Welcome back, <?php echo($steamprofile['personaname']); ?></h1>
						<?php
							}else{
						?>
								<h1>Welcome to DotaHost</h1>
						<?php
							}
						?>
					</span>
				</div>
				<div class="col-md-3"></div>
			</div>
			<div class="row">
				<div class="col-md-4">.</div>
				<div class="col-md-4">
						<?php
							if(!$loggedIn){
								echo('<span style="text-align:center;">');
								steamlogin(); //login button
								echo('</span>');
							}else{
								echo('<img style="display:block;margin-left:auto;margin-right:auto;" src="'.$_SESSION['steam_avatarfull'].'" title="" alt="" />');
							}
						?>
				</div>
				<div class="col-md-4"></div>
			</div>
			<div class="row" style="height:20px;"></div>
			<div class="row">
				<?php
					if($loggedIn){
				?>
					<div class="row">
						<div class="col-md-12">
							<span style="text-align:center;"><?php logoutbutton(); ?></span>
						</div>
					</div>
				<?php 
					}
				?>
			</div>
		</div>

		<?php
			if($loggedIn){
				echo('<script>history.pushState({}, "", "/");</script>');
			}
		?>
		<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
		<!-- Latest compiled and minified JavaScript -->
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
		<script src="main.js"></script>
	</body>
</html>