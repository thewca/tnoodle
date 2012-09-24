<?
include "lib_ref.php";
session_start();
unset($_SESSION["c_id"]);
unset($_SESSION["c_admin"]);
unset($_SESSION["c_country"]);
unset($_SESSION["c_name"]);
header("Location: index.php\r\n");	
?>