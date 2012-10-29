<?
require_once "lib.php";
include "lib_ref_admin.php";
include "db.php";

function formatTime($t,$type=NULL)
{
	if ($t=="") return "&nbsp;";
	if ($t=="DNF" || $t=="DNS") return $t;
	global $timetype;
	if ($type===NULL) $type = $timetype;
	switch($type)
	{
	case 1:
		while(strlen($t)>4 && ((($ch=substr($t,0,1))=="0") || $ch==":")) $t = substr($t,1);
		return $t;
		break;
	case 2:
		if(strlen($t)>1 && substr($t,0,1)=="0") $t = substr($t,1);
		return $t;
		break;
	default:
		return formatTime(substr($t,0,2),2)."/".formatTime(substr($t,2,2),2).($print?" ":"&nbsp;").formatTime(substr($t,4,9),1);
	}
}

function roundString($r,$nr,$c)
{
	switch($r)
	{
	case 1:
		if ($c)
			$st = "Combined ";
		else
			$st = "";
		if ($nr==1)
			$st .= "Final";
		else
		{
			$st .= "First";
			if (!$c) $st .= " Round";
		}
		break;
	case 2:
		if ($nr==2)
			$st = "Final";
		else
			$st = "Second Round";
		break;
	case 3:
		if ($nr==3)
			$st = "Final";
		else
			$st = "Semi Final";
		break;
	case 4:
		$st = "Final";
		break;
	}
	return $st;
}

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
No action has been taken. (<?=$err?>)<br>
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

$cat_id = $_GET["cat_id"];
$round = $_GET["round"];
$comp_id = $_GET["comp_id"];
if (!$cat_id || !$round || $round<=1 || !$comp_id) error(0);

$qualified = strict_mysql_query("SELECT * FROM $regstable WHERE cat_id=$cat_id AND round=$round AND comp_id=$comp_id");
$qualified = ($qualified && mysql_num_rows($qualified)==1);
if (!$qualified) error(1);

$noscore = strict_mysql_query("SELECT * FROM $timestable WHERE cat_id=$cat_id AND round=$round AND comp_id=$comp_id");
$noscore = ($noscore && mysql_num_rows($noscore)==0);
if (!$noscore) error(2);

$event = strict_mysql_query("SELECT * FROM $eventstable WHERE id=".$cat_id);
$lastopenround = 4;
while ($lastopenround>1 && !cased_mysql_result($event,0,"r".$lastopenround."_open")) $lastopenround--;
if ($lastopenround==1 || $round!=$lastopenround) error(3);

$lastround = 4;
while ($lastround>1 && !cased_mysql_result($event,0,"r$lastround")) $lastround--;

$category = strict_mysql_query("SELECT name, timetype FROM categories WHERE id=".$cat_id);
$timetype = cased_mysql_result($category,0,"timetype");
$format = strict_mysql_query("SELECT * FROM formats WHERE id=".cased_mysql_result($event,0,"r".($round-1)."_format"));
$avgtype = cased_mysql_result($format,0,"avgtype");
$query =
	"SELECT $regstable.comp_id, $timestable.average, $timestable.best, reg2.cat_id AS flag, $compstable.name, countries.name AS cname, $compstable.gender FROM $regstable ".
	"JOIN $timestable ON ($regstable.cat_id=$timestable.cat_id AND $regstable.round=$timestable.round AND $regstable.comp_id=$timestable.comp_id) ".
	"LEFT OUTER JOIN $regstable AS reg2 ON ($regstable.cat_id=reg2.cat_id AND reg2.round=$round AND $regstable.comp_id=reg2.comp_id) ".
	"JOIN $compstable ON ($compstable.id=$regstable.comp_id) ".
	"JOIN countries ON (countries.id=$compstable.country_id) ".
	"WHERE $regstable.cat_id=" .$cat_id. " AND $regstable.round=" .($round-1)." AND $timestable.t1 IS NOT NULL AND $timestable.best<\"A\" ".
	"ORDER BY $timestable.average=\"\", $timestable.average, $timestable.best";
$list = strict_mysql_query($query);
$groupsize = cased_mysql_result($event,0,"r".$round."_groupsize");

$top = mysql_num_rows($list);
$line = 0;
$old = null;
$in = 0;
while ($line<$top)
{
	if (!$old && cased_mysql_result($list,$line,"comp_id")==$comp_id) $old=$line;
	if (cased_mysql_result($list,$line,"flag")) $in++;
	$line++;
}
if ($old===null) error(4);
if ($in==$groupsize)
{
	$new = $top-1;
	while (!cased_mysql_result($list,$new,"flag")) $new--;
	$new++;
	if ($new==$top) $new=0;
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<TITLE><?=$_SESSION["c_name"]?></TITLE>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<style type="text/css">
	body {font-family:verdana,sans-serif;font-size:11px;margin:10px 10px;background-color:<?=$color?>;color:#FFFFCC;}
	.header {font-weight:bold;background-color:<?=$dark_color?>;font-size:12px;padding:4px 6px;margin-bottom:4px;}
	.text {margin-left:14px;}
</style>
<body onload='document.getElementById("pw").focus();'>
<div class=header>Competitor misses the round</div>
Competitor <b><?=cased_mysql_result($list,$old,"name")?></b> from <b><?=cased_mysql_result($list,$old,"cname")?></b> misses the <b><?=roundString($round,$lastround,false)?></b> of <b><?=cased_mysql_result($category,0,"name")?></b>.
<P>
<?
if ($in>$groupsize)
{
?>
However, <?=(cased_mysql_result($list,$old,"gender")=="f"?"she":"he")?> won't be replaced because <b>the round was for <?=$groupsize?> people and currently there are <?=$in?> competitors qualified</b>.
<?
}
elseif (!$new)
{
?>
However, <?=(cased_mysql_result($list,$old,"gender")=="f"?"she":"he")?> won't be replaced because <b>no one else qualified</b>.
<?
}
else
{
	echo (cased_mysql_result($list,$old,"gender")=="f"?"She":"He") . " will be replaced by <b>" . cased_mysql_result($list,$new,"name") . "</b>, with ";
	if ($avgtype==2)
		echo "a best score of <b>" . formatTime(cased_mysql_result($list,$new,"best"));
	else
	{
		$avg = cased_mysql_result($list,$new,"average");
		if ($avg)
			$avg = formatTime($avg);
		else
			$avg = "DNF*";
		echo ($avgtype?"a mean":"an average") . " score of <b>$avg";
	}
	echo "</b><br>";
}
?>
<P>
Confirm this operation with your administrative password:
<form action='leaveevt2.php' method='post'>
<input type=password name=pw id=pw>
<input type=hidden name=comp_id value=<?=$comp_id?>>
<input type=hidden name=cat_id value=<?=$cat_id?>>
<input type=hidden name=round value=<?=$round?>>
<input type=hidden name=ncmp_id value=<?=($new?cased_mysql_result($list,$new,"comp_id"):0)?>>
<P>
<input type=submit value=proceed>
<input type=button value=cancel onclick='window.close();'>
</form>
<hr>
<font size=1>Be informed that the competitor will be <?=($new?"replaced in this event, but not in":"removed from this event, but not from")?> any other.</font>
</body>
</html>

<?
mysql_close();
?>
