<?
require_once "lib.php";
require_once "lib_ref_admin.php";
require_once "db.php";
require_once "lib_post.php";

function error($err)
{
	global $color, $light_color, $dark_color;
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<HTML>
<HEAD>
<TITLE>Operation canceled</TITLE>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<style type="text/css">
	body {font-family:verdana,sans-serif;font-size:11px;margin:10px 10px;background-color:<?=$color?>;color:#FFFFCC;}
	.header {font-weight:bold;background-color:<?=$dark_color?>;font-size:12px;padding:4px 6px;margin-bottom:4px;}
	.errors {margin-left:14px;}
</style>
</HEAD>
<BODY>
<div class=header><b>Operation canceled</b></div>
<div class=errors>
Either the way you accessed this URL is irregular or your database has been modified from another computer.<br>
No action has been taken. (<?=($err+10)?>)<br>
<br>
<input type=button value=close onclick='window.close();'>
</div>
</BODY>
</HTML>
<?
	die();
}

$color = "#4b5b51";
$light_color = "#b0c7b4";
$dark_color = "#0a1414";

$result = strict_query("SELECT admin_pw FROM competitions WHERE id=".$_SESSION["c_id"]);
if (cased_mysql_result($result,0,"admin_pw")!=$_POST["pw"])
{
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<HTML>
<HEAD>
<TITLE>Erroneous password</TITLE>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<style type="text/css">
	body {font-family:verdana,sans-serif;font-size:11px;margin:10px 10px;background-color:<?=$color?>;color:#FFFFCC;}
	.header {font-weight:bold;background-color:<?=$dark_color?>;font-size:12px;padding:4px 6px;margin-bottom:4px;}
	.errors {margin-left:14px;}
</style>
</HEAD>
<BODY>
<div class=header><b>Erroneous password!</b></div>
<br>
<input type=button value=close onclick='window.close();'>
</BODY>
</HTML>
<?
	die();
}

$cat_id = _POST_num("cat_id");
$round = _POST_num("round");
$comp_id = _POST_num("comp_id");
$ncmp_id = _POST_num("ncmp_id");
if (!$cat_id || !$round || $round<=1 || !$comp_id) error(0);

$qualified = strict_query("SELECT * FROM $regstable WHERE cat_id=? AND round=? AND comp_id=?", array($cat_id,$round,$comp_id));
$qualified = (sql_num_rows($qualified)==1);
if (!$qualified) error(1);

$noscore = strict_query("SELECT * FROM $timestable WHERE cat_id=? AND round=? AND comp_id=?", array($cat_id,$round,$comp_id));
$noscore = (sql_num_rows($noscore)==0);
if (!$noscore) error(2);

if ($ncmp_id)
{
	$qualified = strict_query("SELECT * FROM $regstable WHERE cat_id=? AND round=? AND comp_id=?", array($cat_id,$round,$ncmp_id));
	$qualified = (!sql_num_rows($qualified));
	if (!$qualified) error(3);

	strict_query("UPDATE $regstable SET comp_id=? WHERE cat_id=? AND round=? AND comp_id=? LIMIT 1", array($ncmp_id,$cat_id,$round,$comp_id));
}
else
	strict_query("DELETE FROM $regstable WHERE cat_id=? AND round=? AND comp_id=? LIMIT 1", array($cat_id,$round,$comp_id));

sql_close();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<HTML>
<BODY onload='opener.location.reload();window.close();'>
</BODY>
</HTML>
