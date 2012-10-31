<?
require_once "lib.php";
require_once "lib_ref_admin.php";

if ($_GET["cat_id"] && $_GET["round"])
{
	require_once "db.php";
	//
	$event = strict_mysql_query("SELECT * FROM $eventstable WHERE id=".$_GET["cat_id"]);
	if (mysql_num_rows($event) && cased_mysql_result($event,0,"r".$_GET["round"]) && cased_mysql_result($event,0,"r".$_GET["round"]."_open") && ($_GET["round"]==4 || !cased_mysql_result($event,0,"r".($_GET["round"]+1)) || !cased_mysql_result($event,0,"r".($_GET["round"]+1)."_open")))
	{
		if (mysql_num_rows(strict_mysql_query("SELECT * FROM $timestable WHERE cat_id=" .$_GET["cat_id"]. " AND round=" .$_GET["round"]." LIMIT 1")))
			die("Can't clear this round: it has times");
		else
		{
			strict_mysql_query("DELETE FROM $regstable WHERE cat_id=" .$_GET["cat_id"]. " AND round=" .$_GET["round"]);
			if ($_GET["round"]==1) strict_mysql_query("UPDATE $compstable SET cat".$_GET["cat_id"]."=\"-\" WHERE cat".$_GET["cat_id"]."=\"X\"");
			strict_mysql_query("UPDATE $eventstable SET r".$_GET["round"]."_open=0 WHERE id=".$_GET["cat_id"]);
		}
	}
	//
	mysql_close();
}
?>
