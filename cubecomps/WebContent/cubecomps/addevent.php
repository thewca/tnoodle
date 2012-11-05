<?
require_once "lib_eve.php";
require_once "lib_ref_admin.php";
require_once "lib_get.php";

$_GETid = _GET_num("id");

if ($_GETid)
{
	require_once "db.php";
	addEve($_GETid);
	sql_close();
	header("Location: events.php\r\n");
}
?>
