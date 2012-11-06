<?
require_once "lib_ref.php";
session_start();
unset($_SESSION["c_id"]);
unset($_SESSION["c_admin"]);
unset($_SESSION["c_country"]);
unset($_SESSION["c_name"]);
if (preg_match("~^admin\\.~i",$_SERVER["HTTP_HOST"]))
	header("Location: index.php\r\n");
else	
	header("Location: admin.php\r\n");
?>