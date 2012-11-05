<?
/* This file is a security measure to prevent entering certain pages directly, instead of through a link.
 * This is because some pages take actions over the database (or where else), and if entered in error, they could cause
 * unexpected or even harmful results.
 */
require_once "inc_private.php";
require_once "lib.php";

if (!refererMatchesHost()) : 
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
   <head>
      <title>Session expired!</title>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta http-equiv="cache-control" content="no-cache" />
   </head>
   <body style="font-family:arial;">
  	<h1 style="color:#0a328c;font-size:1.0em;">SESSION EXPIRED!!!</h1>
	<p style="font-size:0.8em;">Please <a href="/">re-login</a>.</p>
   </body>
  </html>
<?php
    exit;
endif;
