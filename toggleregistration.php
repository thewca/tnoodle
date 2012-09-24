<?
include "lib_reg.php";
include "lib_ref_admin.php";

if ($_GET["comp_id"] && $_GET["cat_id"]) 
{
	include "db.php";
	echo toggleReg($_GET["comp_id"],$_GET["cat_id"]);
	mysql_close();
}
?>