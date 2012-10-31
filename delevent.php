<?
require_once "lib_ref_admin.php";
require_once "db.php";
require_once "lib_get.php";

$_GETid = _GET_num("id");
if ($_GETid)
{
	strict_query ("DELETE FROM $eventstable WHERE id=?", array($_GETid));
	strict_query ("ALTER TABLE $compstable DROP cat?", array($_GETid));
}
sql_close();
?>
