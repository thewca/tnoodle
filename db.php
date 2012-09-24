<?
session_start();
if (!$_SESSION["c_id"])
{
?>
<html>
<body onload="setTimeout('window.location = \'index.php\';',2500)">
Session timed out!
</body>
</html>
<?
	exit();
}

require_once "inc_private.php";

if (preg_match("~(^test\056|//test\056)~i",$_SERVER["HTTP_HOST"]))
{
	mysql_connect(SQL_SERVER, SQL_TEST_USER, SQL_TEST_PASSWORD);
	mysql_select_db(SQL_TEST_DBNAME);
}
else
{
	mysql_connect(SQL_SERVER, SQL_USER, SQL_PASSWORD);
	mysql_select_db(SQL_DBNAME);
}
$result = mysql_query("SELECT * FROM competitions WHERE id=".$_SESSION['c_id']);
if (!mysql_num_rows($result)) die ("You're not allowed to edit that competition any more (".$_SESSION['c_id'].")");
//
$eventstable = "events".$_SESSION["c_id"];
$compstable = "competitors".$_SESSION["c_id"];
$regstable = "registrations".$_SESSION["c_id"];
$timestable = "times".$_SESSION["c_id"];
?>