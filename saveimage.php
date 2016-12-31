<?php

//set random name for the image, used time() for uniqueness

$filename =  time() . '.jpg';
$filepath = 'uploads/';

//read the raw POST data and save the file with file_put_contents()
$result = file_put_contents( $filepath.$filename, file_get_contents('php://input') );
if (!$result) {
	print "ERROR: Failed to write data to $filename, check permissions\n";
	exit();
}
$stack = array();
 array_push($stack, $filepath.$filename);
 array_push($stack, $filename);
 echo json_encode($stack);
//echo $filepath.$filename;
?>
