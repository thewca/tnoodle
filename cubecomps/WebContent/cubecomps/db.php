<?

require_once "lib.php";

if(!isset($_SESSION)) {
        session_start();
}
if (!array_key_exists("c_id", $_SESSION))
{
?>
<html>
<body onload="setTimeout('window.location = \'<?=(preg_match("~^admin\\.~i",$_SERVER["HTTP_HOST"])?"index.php":"admin.php")?>\';',2500)">
Session timed out!
</body>
</html>
<?
        exit();
}

require_once "inc_private.php";

if (preg_match("~^test\\.~i",$_SERVER["HTTP_HOST"]))
{
        $DBH = new PDO(SQL_TEST_DSN, SQL_TEST_USER, SQL_TEST_PASSWORD);
} 
else 
{
        $DBH = new PDO(SQL_DSN, SQL_USER, SQL_PASSWORD);
}
$result = strict_query("SELECT * FROM competitions WHERE id=".$_SESSION['c_id']);
if (sql_num_rows($result) != 1) die ("You're not allowed to edit that competition any more (".$_SESSION['c_id'].")");
//
$eventstable = "events".$_SESSION["c_id"];
$compstable = "competitors".$_SESSION["c_id"];
$regstable = "registrations".$_SESSION["c_id"];
$timestable = "times".$_SESSION["c_id"];
?>
