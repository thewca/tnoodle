<?
require_once "lib.php";
include "lib_ref.php";
session_start();

require_once "inc_private.php";

if (preg_match("~^test\\.~i",$_SERVER["HTTP_HOST"]))
{
	mysql_connect(SQL_SERVER, SQL_TEST_USER, SQL_TEST_PASSWORD);
	mysql_select_db(SQL_TEST_DBNAME);
}
else
{
	mysql_connect(SQL_SERVER, SQL_USER, SQL_PASSWORD);
	mysql_select_db(SQL_DBNAME);
}

function _error($msg)
{
	$_SESSION["c_error"] = $msg;
	unset($_SESSION["c_id"]);
	unset($_SESSION["c_admin"]);
	unset($_SESSION["c_country"]);
	unset($_SESSION["c_name"]);
	header("Location: index.php\r\n");	
	die();
}

$_POSTid = NULL;
if (array_key_exists('id', $_POST))
	$_POSTid = $_POST["id"];
else
	$_POSTid = $_SESSION["c_id"];
if (array_key_exists("pw",$_POST))
	$_POSTpw = $_POST["pw"];
else
	$_POSTpw = $_SESSION["c_pw"];
unset($_SESSION["c_pw"]);


if (is_null($_POSTid)) _error("Invalid calling params");
if (!$_POSTpw) _error("Blank password");
$result = strict_mysql_query("SELECT * FROM competitions WHERE id=".$_POSTid);
if (!$result || !mysql_num_rows($result)) _error("Competition not available");
if (cased_mysql_result($result,0,"admin_pw")==$_POSTpw)
{
	$_SESSION["c_id"] = $_POSTid;
	$_SESSION["c_admin"] = true;
	$_SESSION["c_country"] = cased_mysql_result($result,0,"country");
	$_SESSION["c_name"] = cased_mysql_result($result,0,"name");
}
elseif (cased_mysql_result($result,0,"intro_pw")==$_POSTpw)
{
	$_SESSION["c_id"] = $_POSTid;
	unset($_SESSION["c_admin"]);
	$_SESSION["c_country"] = cased_mysql_result($result,0,"country");
	$_SESSION["c_name"] = cased_mysql_result($result,0,"name");
}
else
	_error("Erroneous password");

$eventstable = "events".$_SESSION["c_id"];
$compstable = "competitors".$_SESSION["c_id"];
$regstable = "registrations".$_SESSION["c_id"];
$timestable = "times".$_SESSION["c_id"];

require_once "inc_initdb.php"; 

mysql_close();
if ($_SESSION["c_admin"])
	header("Location: events.php\r\n");	
else
	header("Location: results.php\r\n");	
?>
