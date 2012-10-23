<?
session_start();
include "lib_ref_admin.php";
?>
<HTML>
<HEAD>
<style type="text/css">
	body {background-color:#4E320C;font-family:arial,sans-serif;font-size:12px;color:#FFFFCC;}
</style>
</HEAD>
<BODY>
<?

function _error($msg)
{
	echo $msg."\r\n";
	echo "<script>self.focus();</script>\r\n";
	echo "</BODY></HTML>";
	die();
}

$test = preg_match("~(^test\056|//test\056)~i",$_SERVER["HTTP_HOST"]);

if ($_FILES["file"]["error"] > 0) _error ("Error: " . $_FILES["file"]["error"]);
$size = $_FILES["file"]["size"] / 1024;
if ($_FILES["file"]["type"] != "image/jpeg" && $_FILES["file"]["type"] != "image/pjpeg") _error ("Error: not a JPEG image (".$_FILES["file"]["type"].")");
if ($size > 100) _error ("Error: file exceeds 100 Kb");
$img = imagecreatefromjpeg($_FILES["file"]["tmp_name"]);
if (!$img) _error ("Error: not a real JPEG image in its inside!");
imagedestroy($img);
//
if (!move_uploaded_file ($_FILES["file"]["tmp_name"], DIR_UPLOADS_ABS.($test?"test_":"")."bg_" . $_SESSION["c_id"] . ".jpg"))
	_error("Can't copy file!!!");
else
	{
?>

<script>
opener.location.reload();
window.close();
</script>

<?
	}
?>
</BODY>
</HTML>
