<?php


	$data_str = file_get_contents("php://input");
	$data_obj = json_decode($data_str);

	if(array_key_exists('ref', $data_obj)){

			echo('1');

			$after = $data_obj->after;
			$last_commit = $after;
			$url = 'https://api.github.com/repos/Jexah/DotaHostServerInit/zipball/master';

			set_time_limit(0);

			$out = fopen('..\\files\\serverinit.zip', 'wb'); 

			$ch = curl_init();
			$headers = array(
				'User-Agent: Jexah',
				'Authorization: token ***REMOVED***'
			);
			curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	    	curl_setopt($ch, CURLOPT_FILE, $out); 

			curl_exec($ch);

			curl_close($ch);

			fclose($out);

			$hash = hash_file('crc32b', '..\\files\\serverinit.zip');

			file_put_contents('..\\addons\\serverinit.txt', $hash."\n".$last_commit);
	}else{

		echo('2');
		
		$release = $data_obj->release;
		$tag_name = $release->tag_name;
		$assets = $release->assets[0]; 
		$downloadURL_str = $assets->browser_download_url;
		$downloadFileName_str = $assets->name;

		// Download the release into filename
		file_put_contents(getcwd().'\\'.$downloadFileName_str, fopen($downloadURL_str, 'r'));

		// Generate hash
		$hash = hash_file('crc32b', getcwd().'\\'.$downloadFileName_str);

		// Get the downloaded file name seperated by '.'
		$downloadFileName_arr = explode('.', $downloadFileName_str);

		// Splice off the last element (file extension)
		array_splice($downloadFileName_arr, count($downloadFileName_arr)-1, 1);

		// Join the file name together
		$downloadFileNameNoExtension_str = implode('.', $downloadFileName_arr);

		// Write tagname and crc32 to addons folder
		file_put_contents('..\\addons\\'.$downloadFileNameNoExtension_str.'.txt', $downloadURL_str."\n".$hash);

		// Delete file downloaded
		unlink(getcwd().'\\'.$downloadFileName_str);
	}
?>