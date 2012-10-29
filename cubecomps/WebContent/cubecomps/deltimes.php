<?
include "lib_ref.php";

if ($_GET["comp_id"] && $_GET["cat_id"] && $_GET["round"])
{
	include "db.php";
	//
	strict_mysql_query("DELETE FROM $timestable WHERE cat_id=" .$_GET["cat_id"]. " AND round=" .$_GET["round"]. " AND comp_id=" .$_GET["comp_id"]);
	//
	mysql_close();
}
?>
