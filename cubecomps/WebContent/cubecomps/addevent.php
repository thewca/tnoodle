<?
include "lib_eve.php";
include "lib_ref_admin.php";

if ($_GET["id"])
{
	include "db.php";
	addEve($_GET["id"]);
	mysql_close();
	header("Location: events.php\r\n");
}
?>