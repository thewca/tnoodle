<?
include "lib_ref_admin.php";
include "db.php";

if ($_GET["id"])
{
	if (!mysql_query ("DELETE FROM $eventstable WHERE id=" . $_GET["id"]))
	{
		echo mysql_error();
		mysql_close();
		die();
	}

	if (!mysql_query ("ALTER TABLE $compstable DROP cat" . $_GET["id"]))
	{
		echo mysql_error();
		mysql_close();
		die();
	}
}
mysql_close();
?>