<?
require_once "lib_eve.php";
require_once "lib_ref_admin.php";

if ($_GET["id"])
{
	require_once "db.php";
	addEve($_GET["id"]);
	mysql_close();
	header("Location: events.php\r\n");
}
?>