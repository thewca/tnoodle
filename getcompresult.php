<?
include "lib_ref.php";

if ($_GET["comp_id"] && $_GET["cat_id"] && $_GET["round"])
{
	include "db.php";
	//
	$qualified = mysql_num_rows(mysql_query("SELECT round FROM $regstable WHERE cat_id=" .$_GET["cat_id"]. " AND round=" .$_GET["round"]. " AND comp_id=" .$_GET["comp_id"]));
	if ($qualified)
	{
		$alreadyhastimes = mysql_num_rows(mysql_query("SELECT round FROM $timestable WHERE cat_id=" .$_GET["cat_id"]. " AND round=" .$_GET["round"]. " AND comp_id=" .$_GET["comp_id"]));
		$competitor = mysql_query("SELECT name FROM $compstable WHERE id=".$_GET["comp_id"]);
		echo ($alreadyhastimes?"1":"0").mysql_result($competitor,0,"name");
	}
	//
	mysql_close();
}
?>