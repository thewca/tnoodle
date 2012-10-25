<?
require_once "lib.php";
session_start();
$IE = (preg_match("/msie/i",$_SERVER["HTTP_USER_AGENT"]) || preg_match("/internet explorer/i",$_SERVER["HTTP_USER_AGENT"]));
$live = preg_match("~^live\\.~i",$_SERVER["HTTP_HOST"]); // a more flexible detection of the live results page
//echo "IE=$IE, live=$live<br>";
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<HTML>
<HEAD>
<TITLE>Cube Competitions</TITLE>
<META NAME="Author" CONTENT="">
<META NAME="Keywords" CONTENT="">
<META NAME="Description" CONTENT="">
<!--meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /-->
<style type="text/css">
	body {font-family:arial,sans-serif;font-size:12px;font-weight:bold;background-color:white;color:#004;margin:0;}
	table {font-size:12px;}
	img {border:0;}
	a {color:black;font-weight:bold;text-decoration:none;}
	a:hover {color:#CC0000;}
	div.header {height:34px;font-size:20px;font-weight:bold;color:white;background-color:#000022;}
	b.p {padding:0 0 0 10px;color:#FFA;font-size:14px;}
	b.pp {padding:0 0 0 35px;}
	.list {background-color:#FFFFBB;height:120px;width:640px;overflow-x:auto;overflow-y:hidden;padding:10px; margin:0 0 0 20px;}
</style>
</HEAD>
<?
if (array_key_exists("c_error",$_SESSION))
{
	echo "<BODY onload='alert(\"".$_SESSION["c_error"]."\")'>\r\n";
	unset($_SESSION["c_error"]);
}
else
	echo "<BODY>\r\n";

if (!$live)
{
?>
<script>
function showPWInput(cid,divid)
{
	var obj;
	var x = 1;
	while (obj = document.getElementById("div"+x))
	{
		obj.innerHTML = "";
		obj.style.display = "none";
		x++;
	}
	with (document.getElementById("div"+divid))
	{
		innerHTML = "<form style='margin:6px 0px 6px 50px;' action='identification.php' method=post><input type=hidden name=id value="+cid+">password: <input type=password id=pw name=pw style='width:80px;'> <input type=submit value=enter></form>";
		style.display = "inline";
		document.getElementById("pw").focus();
	}
}
</script>
<?
}

function datesToStr($date_b,$date_e)
{
	$mons = array(1 => "Jan", 2 => "Feb", 3 => "Mar", 4 => "Apr", 5 => "May", 6 => "Jun", 7 => "Jul", 8 => "Aug", 9 => "Sep", 10 => "Oct", 11 => "Nov", 12 => "Dec");
	//
	$m_b = (int)substr($date_b,5,2);
	$d_b = (int)substr($date_b,8,2);
	$y_b = (int)substr($date_b,0,4);
	$m_e = (int)substr($date_e,5,2);
	$d_e = (int)substr($date_e,8,2);
	$y_e = (int)substr($date_e,0,4);
	if ($y_b==$y_e)
	{
		if ($m_b==$m_e)
		{
			if ($d_b==$d_e)
				return $mons[$m_b]." ".$d_b.", ".$y_b;
			else
				return $mons[$m_b]." ".$d_b."-".$d_e.", ".$y_b;
		}
		else
			return $mons[$m_b]." ".$d_b."-".$mons[$m_e]." ".$d_e.", ".$y_b;
	}
	else
		return $mons[$m_b]." ".$d_b.", ".$y_b." - ".$mons[$m_e]." ".$d_e.", ".$y_e;
}

function listComps($txt)
{
	global $result, $count, $IE, $live;
	$width = 300;
	$twidth = mysql_num_rows($result)*$width;
	echo "<div class=header>";
	if ($IE) 
		echo "<span style='vertical-align:-6px;margin:12px;'>$txt</span></div>";
	else
		echo "<img src='img/header-tip.gif'><span style='vertical-align:8px'>$txt</span></div>";

	echo "<DIV class=list>";
	//echo "<P style='width:".$twidth."px;'>";
	echo "<table cellpadding=0 cellspacing=0 width=".$twidth."><tr valign=top>";
	while ($row=cased_mysql_fetch_array($result))
	{
		$count++;
		//echo "<SPAN style='width:".$width."px;'>";
		echo "<td><div style='width:".$width."px;'>";
		echo "<B class=p>";
		if ($live)
			echo "<a href='live.php?cid=".$row["id"]."'>";
		else
			echo "<a style='cursor:pointer;' onclick='showPWInput(".$row["id"].",$count);'>";
		echo "<img src='img/cube-icon.gif' style='vertical-align:-5px;'> ".$row["name"]."</a></B><br>";
		echo "<span id=div".$count." style='display:none;'></span>";
		echo "<B class=pp>".datesToStr($row["date_b"],$row["date_e"])."</B><br>";
		echo "<B class=pp>".$row["place"]." - ".$row["countryname"]."</B><br>";
		if ($website = $row["website"])
		{
			$pos = strpos($website,"/");
			if (!$pos)
				$website_host = $website;
			else
				$website_host = substr($website,0,$pos);
			if (substr($website,0,7) != "http://") $website = "http://$website";
			echo "<B class=pp><a href='$website' target=_blank>$website_host</a></B><br>";
		}
		//echo "</SPAN>";
		echo "</div></td>";
	}
	echo "</tr></table>";
	//echo "</P>";
	echo "</DIV><p>";
}

echo "<table cellspacing=0 cellpadding=0 width=100% height=100%>";
echo "<tr valign=top><td width=40%>";

echo "<table cellspacing=0 cellpadding=0 height=100%>";
echo "<tr valign=top><td><img src='img/home-top.gif'></td></tr>";
$test = preg_match("~^test\\.~i",$_SERVER["HTTP_HOST"]);
if ($test)
	echo "<tr height=100%><td align=right><div style='font-size:80px;font-weight:bold;'>TEST</div><div style='font-size:34px;font-weight:bold;'>environment</div></td></tr></table>";
else
	echo "<tr valign=bottom><td><img src='img/home-bottom.gif'></td></tr></table>";

echo "<td width=60%><br><br><img src='img/logo.gif'><br><br><br>";

require_once "inc_private.php";

if ($test)
{
	mysql_connect(SQL_SERVER, SQL_TEST_USER, SQL_TEST_PASSWORD);
	mysql_select_db(SQL_TEST_DBNAME);
}
else
{
	mysql_connect(SQL_SERVER, SQL_USER, SQL_PASSWORD);
	mysql_select_db(SQL_DBNAME);
}
//
$count = 0;
$result = strict_mysql_query("SELECT competitions.*, countries.name AS countryname FROM competitions JOIN countries ON countries.id=competitions.country WHERE NOW()>=date_b AND NOW()<=date_e ORDER BY date_b");
if (mysql_num_rows($result)) listComps("Competitions in progress");
//
$result = strict_mysql_query("SELECT competitions.*, countries.name AS countryname FROM competitions JOIN countries ON countries.id=competitions.country WHERE NOW()>date_e ORDER BY date_b DESC");
if (mysql_num_rows($result)) listComps("Past competitions");
//
$result = strict_mysql_query("SELECT competitions.*, countries.name AS countryname FROM competitions JOIN countries ON countries.id=competitions.country WHERE NOW()<date_b ORDER BY date_b");
if (mysql_num_rows($result)) listComps("Upcoming competitions");
//
mysql_close();

echo "<div style='color:#444;'><br><br>";
if (!$live) echo "Looking for the <a href='http://live.".DOMAIN."'>live results</a> site?<br><br>";
echo "WCA delegates and competitions organizers, please <a href='http://www.facebook.com/cubecomps' target=_blank>contact here</a><br><br>";
if (!$live) echo "<iframe src='//www.facebook.com/plugins/like.php?href=http%3A%2F%2Fwww.facebook.com%2Fcubecomps&amp;send=false&amp;layout=button_count&amp;width=450&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp;height=21&amp;appId=234783519900971' scrolling='no' frameborder='0' style='border:none; overflow:hidden; width:450px; height:21px;' allowTransparency='true'></iframe><br><br>";
echo "by <a href='http://www.binarema.es' target=_blank>Binarema</a>";
echo "</div></td></tr>";

echo "</td></tr><table>";
?>
</BODY>
</HTML>
