<?
require_once "lib.php";
include "lib_reg.php";
include "lib_ref_admin.php";

if ($_GET["id"])
{
	include "db.php";
	//
	if (mysql_num_rows(strict_mysql_query("SELECT * FROM $timestable WHERE comp_id=".$_GET["id"]))) 
		die("Can't delete a competitor who already has results in the competition");
	$competitor = strict_mysql_query("SELECT * FROM $compstable WHERE id=".$_GET["id"]);
	if (!mysql_num_rows($competitor))
	{
		mysql_close();
		die("Competitor id not found!");
	}
	$categories = strict_mysql_query("SELECT id FROM $eventstable");
	if(!$categories) {
		die('Invalid query: ' . mysql_error());
	}
	while ($rcat=cased_mysql_fetch_array($categories)) {
		if (cased_mysql_result($competitor,0,"cat".$rcat["id"])=="X") {
			toggleReg($_GET["id"],$rcat["id"]);
		}
	}
	if (!strict_mysql_query ("DELETE FROM $compstable WHERE id=" . $_GET["id"]))
	{
		echo mysql_error();
		mysql_close();
		die();
	}
	mysql_close();
}
?>
