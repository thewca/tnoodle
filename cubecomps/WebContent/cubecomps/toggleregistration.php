<?
require_once "lib_reg.php";
require_once "lib_ref_admin.php";

if ($_GET["comp_id"] && $_GET["cat_id"]) 
{
	require_once "db.php";
	echo toggleReg($_GET["comp_id"],$_GET["cat_id"]);
	mysql_close();
}
?>
