<?
include "lib_reg.php";
include "lib_ref_admin.php";

if ($_GET["id"])
{
	include "db.php";
	//
	if (mysql_num_rows(mysql_query("SELECT * FROM $timestable WHERE comp_id=".$_GET["id"]))) 
		die("Can't delete a competitor who already has results in the competition");
	$competitor = mysql_query("SELECT * FROM $compstable WHERE id=".$_GET["id"]);
	if (!mysql_num_rows($competitor))
	{
		mysql_close();
		die("Competitor id not found!");
	}
	$categories = mysql_query("SELECT id FROM $eventstable");
	while ($rcat=mysql_fetch_array($categories))
		if (mysql_result($competitor,0,"cat".$rcat["id"])=="X")
			toggleReg($_GET["id"],$rcat["id"]);
	if (!mysql_query ("DELETE FROM $compstable WHERE id=" . $_GET["id"]))
	{
		echo mysql_error();
		mysql_close();
		die();
	}
	mysql_close();
}
?>