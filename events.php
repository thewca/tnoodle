<?
include "lib_admin.php";
include "db.php";

function timelimitNum($t)
{
	if (!$t) return 0;
	$hh = (int)substr($t,7,2);
	$sec = (int)substr($t,4,2);
	$min = (int)substr($t,0,3);
	$hh = (($min*60)+$sec)*100+$hh;
	return $hh;
}

function formatTimelimit($t)
{
	while(strlen($t)>4 && ((($ch=substr($t,0,1))=="0") || $ch==":")) $t = substr($t,1);
	return $t;
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

$color = "#6b7b71";
$light_color = "#b0c7b4";
$dark_color = "#0a1414";

?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<HTML>
<HEAD>
<TITLE><?=$_SESSION["c_name"]?></TITLE>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<META NAME="Author" CONTENT="">
<META NAME="Keywords" CONTENT="">
<META NAME="Description" CONTENT="">
<style type="text/css">
	body {font-family:arial,sans-serif;font-size:14px;background-color:<?=$color?>;color:#2a3837;}
	a {color:black;font-weight:bold;text-decoration:none;}
	a:hover {color:#CCFF00;}
	.header {color:white;background-color:<?=$dark_color?>;font-size:14px;font-weight:bold;padding:4px 10px 4px 10px;margin-bottom:4px;}
	.tcats td {font-size:12px;width:50%;background-color:<?=$light_color?>;padding:5px 5px 5px 0;}
	table.t_tabs {font-size:30px;border-style:none;color:#CCFF00;}
	table.t_tabs td {font-weight:bold;padding:0 20px;}
	td.t_sel:hover {background-color:<?=$light_color?>;}
	.nested {font-family:arial,sans-serif;font-size:12px;}
	.nested td {padding:0;}
	img {position:relative;top:-5px;}
</style>
</HEAD>
<BODY>

<script>

var timerKA = setTimeout("keepAlive();",600000);

function keepAlive()
{
	var req = createXMLHttpRequest();
	req.open ("GET", "keepalive.php");
	req.send (null);
	//
	timerKA = setTimeout("keepAlive();",600000);
}

function createXMLHttpRequest() 
{
	var xmlHttp=null;
	if (window.ActiveXObject) 
		xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
	else 
		if (window.XMLHttpRequest) 
			xmlHttp = new XMLHttpRequest();
	return xmlHttp;
}

var hlSpan;
var normalColor = new Array(176,199,180);
var hlColor = new Array(255,204,0);
var hlSteps = 10;
var hlStep;
var hlTimer;
var hlSpeed = 150;

function d2h(d) 
{
	d = Math.round(d);
	var st = d.toString(16);
	while (st.length < 2) st = '0'+st;
	return st;
}

function toNormal()
{
	var color = hlSpan.style.backgroundColor = "#"+
		d2h(hlColor[0]+((normalColor[0]-hlColor[0])/hlSteps)*hlStep)+
		d2h(hlColor[1]+((normalColor[1]-hlColor[1])/hlSteps)*hlStep)+
		d2h(hlColor[2]+((normalColor[2]-hlColor[2])/hlSteps)*hlStep);
	hlStep = hlStep + 1;
	if (hlStep <= hlSteps)
		hlTimer = setTimeout("toNormal();",hlSpeed);
	else
	{
		hlSpan.style.backgroundColor = "inherit";
		hlSpan = 0;
	}
}

function highlight(spanId)
{
	if (hlSpan) 
	{
		clearTimeout(hlTimer);
		hlSpan.style.backgroundColor = "inherit";
	}
	hlSpan = document.getElementById(spanId);
	if (hlSpan)
	{
		hlSpan.style.backgroundColor = "#"+d2h(hlColor[0])+d2h(hlColor[1])+d2h(hlColor[2]);
		hlStep = 1;
		hlTimer = setTimeout("toNormal();",hlSpeed);
	}
}

function updateData(spanId,url,outTxt)
{
	if (!outTxt) outTxt = " % ";
	var req = createXMLHttpRequest();
	req.open ("GET", url, false);
	req.send (null);
	//
	if (spanId)
	{
		document.getElementById(spanId).innerHTML = outTxt.replace("%",req.responseText);
		highlight(spanId);
	}
	else
		window.location.reload();
}

function switchDataEvents(spanId,eventId,field)
{
	updateData(spanId,"switcheventfld.php?id="+eventId+"&fld="+field);
}

function setGroupSize(spanId,eventId,field,minValue,maxValue)
{
	var newValue = prompt("People admitted ("+minValue+"-"+maxValue+")","");
	if (newValue)
	{
		if (isNaN(newValue))
			alert("Not a number!");
		else if (newValue < minValue || newValue > maxValue)
			alert("Value must be between "+minValue+" and "+maxValue);
		else
			updateData(spanId,"seteventfld.php?id="+eventId+"&fld="+field+"&value="+newValue," for % people ");
	}
}

function setTimeLimit(spanId,eventId,curValue)
{
	if (!curValue) curValue = "00:00.00"; 
	var newValue = prompt("Cutoff (blank for no cutoff)",curValue);
	if (newValue==null) return;
	if (newValue && !/^([0-9]{1,2}:[0-5][0-9]\056[0-9]{2}|[0-5]?[0-9]\056[0-9]{2}|[0-9]{1,2}:[0-5][0-9])$/.test(newValue))
		alert("Invalid time or time format");
	else
		updateData(null,"seteventfld.php?id="+eventId+"&fld=timelimit&value="+newValue);
}

function callPage(url)
{
	var req = createXMLHttpRequest();
	req.open ("GET", url, false);
	req.send (null);
	if (!req.responseText)
		window.location.reload();
	else
		alert(req.responseText);
}

</script>

<table class=t_tabs><tr>
<td>EVENTS</td><td class=t_sel><a href='competitors.php'>COMPETITORS</a></td><td class=t_sel><a href='results.php'>RESULTS</a></td><td class=t_sel><a href='misc.php'>MISC</a></td>
</tr></table>

<?
echo "<table class=tcats width=100% cellspacing=10 border=0>";
$nevents = 0;
$result = mysql_query("SELECT $eventstable.*, categories.name, categories.canhavetimelimit, categories.abbr FROM $eventstable JOIN categories WHERE $eventstable.id=categories.id ORDER BY categories.id");
if (!$result) echo mysql_error();
$formats = mysql_query("SELECT * FROM formats ORDER BY id");
while($row=mysql_fetch_array($formats)) $fmts[] = $row["name"];
while($event=mysql_fetch_array($result))
{
	$lrwt = mysql_query("SELECT round FROM $timestable WHERE cat_id=".$event["id"]." ORDER BY round DESC LIMIT 1");
	if (mysql_num_rows($lrwt))
		$last_rwt = mysql_result($lrwt,0,"round");
	else
		$last_rwt = 0;
	//
	if (!($nevents % 2))
	{
		if ($nevents) echo "</tr>";
		echo "<tr valign=top>";
	}
	$nevents++;
	//
	$nrounds = 4;
	while ($nrounds>1 && !$event["r$nrounds"]) $nrounds--;
	//
	echo "<td>";
	echo "<table cellspacing=0 border=0 class=nested><tr valign=top><td style='width:58px;'><img border=0 src='img/corner".$event["abbr"].".jpg'>";
	if (!$event["r1_open"]) echo "<br>&nbsp;&nbsp;<a style='cursor:pointer;' title='remove event' onclick='if (confirm(\"Are you sure you want to remove the event?\")) callPage(\"delevent.php?id=". $event["id"] ."\");'><img border=0 src='img/del.gif'></a>";
	echo "</td><td style='width:100%;'><div class=header>".$event["name"]."</div>";
	echo "<DIV style='margin-left:10px;'>";
	$round = 1;
	$rnd = "r1";
	while($event[$rnd])
	{	
		$nextrnd = "r".($round+1);
		echo "<b>".roundString($round,$nrounds,($event["canhavetimelimit"] && $round==1 && $event["timelimit"]))."</b> ";
		// combined
		if ($event["canhavetimelimit"] && $round==1)
		{
			$st = (timelimitNum($event["timelimit"])?"cutoff ".formatTimelimit($event["timelimit"]):"no cutoff");
			if ($round <= $last_rwt)
				echo "-<span onclick='alert(\"Change not allowed: this round already has results\");'> $st </span>";
			else
			{
				echo "-<span id=" . $rnd."_".$event["id"] . "_1 style='cursor:pointer;' onclick='setTimeLimit(\"" . $rnd."_".$event["id"] . "_1\",\"" . $event["id"] . "\", \"".substr($events["timelimit"],1)."\");' title='click to change'> $st </span>";
			}
		}
		// format
		if ($round <= $last_rwt)
			echo "-<span onclick='alert(\"Change not allowed: this round already has results\");'> " .$fmts[(int)$event[$rnd."_format"]-1]. " </span>";
		else
		{
			echo "-<span id=" . $rnd."_".$event["id"] . "_2 style='cursor:pointer;' onclick='switchDataEvents(\"" . $rnd."_".$event["id"] . "_2\",\"" . $event["id"] . "\",\"" . $rnd . "_format\");' title='click to switch'> " . $fmts[(int)$event[$rnd."_format"]-1] . " </span>";
		}
		// groupsize
		if ($event[$rnd."_open"])
		{
			$in = mysql_result(mysql_query("SELECT COUNT(*) AS count FROM $regstable WHERE cat_id=".$event["id"]." AND round=".$round),0,"count");
			if ($round==1) $r1in = $in;
			if ($round>1 || $event[$rnd."_groupsize"] > $in)
				$out = 0;
			else
				$out = mysql_result(mysql_query("SELECT COUNT(*) AS count FROM $compstable WHERE cat".$event["id"]."=\"-\""),0,"count");
			$out = ($out?", $out out":"");
			echo "- $in people in$out ";
		}
		else
		{
			if ($round==1) $r1in = $event[$rnd."_groupsize"];
			if ($round < 4 && $event[$nextrnd])
				echo "-<span onclick='alert(\"Change not allowed: round is not the last one. \\nTry removing rounds.\");'> for ".$event[$rnd."_groupsize"]." people </span>";
			else
			{
				if ($round>1 && $event[$prevrnd."_open"])
					$maxgs = floor($in*.75);
				else
					$maxgs = $round==1 ? 999 : floor($event[$prevrnd."_groupsize"]*.75);
				$mings = 2;
				echo "-<span id=" . $rnd."_".$event["id"] . "_3 style='cursor:pointer;' onclick='setGroupSize(\"" . $rnd."_".$event["id"] . "_3\",\"" . $event["id"] . "\",\"" . $rnd."_groupsize\", $mings, $maxgs);' title='click to change'> for ".$event[$rnd."_groupsize"]." people </span>";
			}
		}
		// open
		if (!$event[$rnd."_open"] && ($round == 1 || $event[$prevrnd."_open"])) 
			echo " - <a style='cursor:pointer;' onclick='callPage(\"populate.php?cat_id=".$event["id"]."&round=".$round."\");'>[open]</a>";
		// clear
		if ($event[$rnd."_open"]) 
		{
			echo " -";
			if ($round == 4 || !$event[$nextrnd] || !$event[$nextrnd."_open"])
			{
				if ($round <= $last_rwt)
					echo " <span onclick='alert(\"Cannot clear this round: it already has results\");'><b style='color:black;'>[clear]</b></span>";
				else
					echo " <a style='cursor:pointer;' onclick='callPage(\"clear.php?cat_id=" .$event["id"]. "&round=" .$round. "\");'>[clear]</a>";
			}
			// rest
			echo " <a href='timessheet.php?cat_id=" .$event["id"]. "&round=" .$round. "' target=_blank>[cards]</a>";
			echo " <a href='results.php?cat_id=" .$event["id"]. "&round=" .$round. "'>[results]</a>";
		}
		//
		echo "<br />";
		//
		$prevrnd = $rnd;
		$round += 1;
		$rnd = "r".$round;
	}
	if ($r1in <= 7)
		$maxrounds = 1;
	elseif ($r1in <= 15)
		$maxrounds = 2;
	elseif ($r1in <= 99)
		$maxrounds = 3;
	else
		$maxrounds = 4;
	if ($round <= $maxrounds && (($event[$prevrnd."_open"] && $in > 2) || (!$event[$prevrnd."_open"] && $event[$prevrnd."_groupsize"] > 2))) 
	{
		echo "<a style='cursor:pointer;' onclick='callPage(\"addround.php?id=".$event["id"]."\");'>[add round]</a> ";
		$b = true;
	}
	if ($event["r2"] && !$event[$prevrnd."_open"]) 
	{
		echo "<a style='cursor:pointer;' onclick='callPage(\"delround.php?id=".$event["id"]."\");'>[remove last round]</a>";
		$b = true;
	}
	if ($b) echo "<br />";
	echo "</DIV></td></tr></table></td>";
}
if ($nevents) echo "</tr>";
echo "<tr valign=top>";

$result = mysql_query("SELECT categories.* FROM categories LEFT OUTER JOIN $eventstable ON categories.id=$eventstable.id WHERE $eventstable.id IS NULL ORDER BY categories.id");
if (mysql_num_rows($result))
{
	echo "<td><table cellspacing=0 border=0 class=nested><tr valign=top><td style='width:58px;'><img border=0 src='img/corneradd.jpg'></td><td style='width:100%;'><div class=header>Add event</div><DIV style='margin-left:75px;'><form method=get action=\"addevent.php\"><select name=id>";
	while($row=mysql_fetch_array($result)) 
		echo "<option value=".$row["id"].">".$row["name"]."</option>";
	echo "<input type=submit value=\"add\"></form></DIV></td></tr></table></td>";
}

mysql_close();
?>
<td><table cellspacing=0 border=0 class=nested><tr valign=top><td style='width:58px;'><img border=0 src='img/cornerimport.jpg'></td><td style='width:100%;'><div class=header>Import .CSV or .XLS registration file</div><DIV style='margin-left:75px;'><form action="importcsv.php" target="w_csvimport" onsubmit="w=window.open('', 'w_csvimport', 'width=600, height='+screen.availHeight+', top=0, left='+(screen.availWidth-600)+', location=0, scrollbars=1, resizable=1');w.focus();" method="post" enctype="multipart/form-data">
<label for="file">file:</label>
<input type="file" name="file" id="file" />
<input type="submit" value="submit" style="float:right;"/>
</form></DIV></td></tr></table></td></tr>
</table>
<?
if (preg_match("/msie/i",$_SERVER["HTTP_USER_AGENT"]) || preg_match("/internet explorer/i",$_SERVER["HTTP_USER_AGENT"]))
	echo "<br><center><b>so you're using IE...&nbsp;&nbsp;&nbsp;:'(</b></center>";

if ($_SESSION["c_error"])
{
	echo "<script>alert(\"".$_SESSION["c_error"]."\");</script>\r\n";
	unset($_SESSION["c_error"]);
}
?>
</BODY>
</HTML>