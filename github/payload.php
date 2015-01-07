<?php

	$data_str = file_get_contents("php://input");
	$data_obj = json_decode($data_str);

	if($data_obj){
		
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
		file_put_contents('..\\addons\\'.$downloadFileNameNoExtension_str.'.txt', $tag_name."\n".$hash);

		// Delete file downloaded
		unlink(getcwd().'\\'.$downloadFileName_str);
	}
?>