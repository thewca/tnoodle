<?
include "lib_ref_admin.php";
session_start();
include "inc_private.php";
$test = preg_match("~(^test\056|//test\056)~i",$_SERVER["HTTP_HOST"]);
$fname = DIR_UPLOADS_ABS.($test?"test_":"")."bg_" . $_SESSION["c_id"] . ".jpg";
if (file_exists($fname)) unlink($fname);
?>