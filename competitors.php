<?
require_once "lib.php";
include "lib_admin.php";

function abbr($t)
{
	$ch = substr($t,0,1);
	if ($ch >= "0" && $ch <= "9")
		return substr($t,-3);
	else
		return substr($t,0,3);
}

function columnHeader($caption,$o)
{
	global $order;
	$st = "";
	if ($order!=$o) $st .= "<a href='competitors.php?order=$o' title='click to sort by this column' style='color:#2a3837;'>";
	$st .= $caption;
	if ($order!=$o) 
		$st .= "</a>";
	else
		$st .= "<img border=0 src='img/order.gif'>";
	return $st;
}

include "db.php";

$categories = strict_mysql_query("SELECT * FROM categories JOIN $eventstable ON categories.id=$eventstable.id ORDER BY categories.id");
$ncats = mysql_num_rows($categories);
$catwidth = 30;

$color = "#6b7b71";
$light_color = "#b0c7b4";
$dark_color = "#0a1414";

?>

<html>
<head>
<TITLE><?=$_SESSION["c_name"]?></TITLE>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<style type="text/css">
	body {font-family:arial,sans-serif;font-size:14px;background-color:<?=$color?>;color:#FFFFCC;}
	a {color:black;font-weight:bold;text-decoration:none;}
	a:hover {color:#CCFF00;}
	.comprow_odd {background-color:#fff;}
	.comprow_odd:hover {background-color:#bbf;}
	.comprow_even {background-color:#ddd;}
	.comprow_even:hover {background-color:#bbf;}
	.col_cl {width:26px;text-align:right;}
	.col_wi {width:86px;text-align:left}
	.col_nm {width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;}
	.col_bd {width:72px;text-align:left}
	.col_ct {width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;}
	.col_gd {width:40px;}
	.col_ot {width:120px;}
	#container {display:inline-block;overflow-y:auto; overflow-x:hidden;}
	#container, table.TH {-moz-box-shadow: 6px 6px 5px <?=$dark_color?>;-webkit-box-shadow: 6px 6px 5px <?=$dark_color?>; box-shadow: 6px 6px 5px <?=$dark_color?>;}
	table {color:black;font-size:12px;}
	td, th {padding:0 3px;}
	th {color:#2a3837;background-color:<?=$light_color?>;}
	table.t_tabs {font-size:30px;border-style:none;color:#CCFF00;}
	table.t_tabs td {font-weight:bold;padding:0 20px;}
	td.t_sel:hover {background-color:<?=$light_color?>;}
</style>
</head>
<body onload='doResize();document.getElementById("WCAid").focus();' onresize='docResize();'> 
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

var timerResize;

function docResize()
{
	clearTimeout(timerResize);
	timerResize = setTimeout("doResize();",500);
}

function getHeight(id)
{
	return (document.getElementById(id).height ? document.getElementById(id).height : document.getElementById(id).offsetHeight);
}

function setHeight(id,v)
{
	document.getElementById(id).style.height = v+"px";
}

function getWidth(id)
{
	return (document.getElementById(id).height ? document.getElementById(id).height : document.getElementById(id).offsetHeight);
}

function setWidth(id,v)
{
	document.getElementById(id).style.height = v+"px";
}

function doResize()
{
	var h = window.innerHeight ? window.innerHeight : document.documentElement.offsetHeight;
	h = Math.min(h-90, getHeight("T_TD"));
	setHeight ("container",h);
	//setWidth ("container",getWidth("T_TH")+50);
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

var hlSpan = new Array();
var normalColor = new Array(255,255,255);
var hlColor = new Array(255,204,0);
var hlSteps = 10;
var hlStep = new Array();
var hlTimer = new Array();
var hlSpeed = 150;

function d2h(d) 
{
	d = Math.round(d);
	var st = d.toString(16);
	while (st.length < 2) st = '0'+st;
	return st;
}

function toNormal(idx)
{
	var color = hlSpan[idx].style.backgroundColor = "#"+
		d2h(hlColor[0]+((normalColor[0]-hlColor[0])/hlSteps)*hlStep[idx])+
		d2h(hlColor[1]+((normalColor[1]-hlColor[1])/hlSteps)*hlStep[idx])+
		d2h(hlColor[2]+((normalColor[2]-hlColor[2])/hlSteps)*hlStep[idx]);
	hlStep[idx] = hlStep[idx] + 1;
	if (hlStep[idx] <= hlSteps)
		hlTimer[idx] = setTimeout("toNormal("+idx+");",hlSpeed);
	else
	{
		hlSpan[idx].style.backgroundColor = "inherit"; 
		hlSpan[idx] = 0;
	}
}

function highlight(idx,spanId)
{
	if (hlSpan[idx]) 
	{
		clearTimeout(hlTimer[idx]);
		hlSpan[idx].style.backgroundColor = "inherit"; 
	}
	hlSpan[idx] = document.getElementById(spanId);
	if (hlSpan[idx])
	{
		hlSpan[idx].style.backgroundColor = "#"+d2h(hlColor[0])+d2h(hlColor[1])+d2h(hlColor[2]);
		hlStep[idx] = 1;
		hlTimer[idx] = setTimeout("toNormal("+idx+");",hlSpeed);
	}
}

function validateWCAid(obj)
{
	var id = obj.value;
	if (id=="") return;
	id = id.toUpperCase();
	if (!/^\d{4}[A-Z]{4}\d{2}$/.test(id))
	{
		alert("\""+id+"\" is not a valid WCA id!");
		obj.value = "";
		obj.focus();
	}
}

function validateBirth(obj)
{
	var d = obj.value;
	if (d=="") return "";
	if (!/^\d{4}-\d{2}-\d{2}$/.test(d))
	{
		alert("\""+d+"\" is not a valid date format (yyyy-mm-dd)!");
		obj.value = "";
		obj.focus();
	}
	else
	{
		var month = d.substring(5,7);
		month = parseInt(month,10);
		var day = d.substring(8,10);
		day = parseInt(day,10);
		var year = parseInt(d.substring(0,4),10);
		var dt = new Date(Date.UTC(year,month-1,day));
		if (dt.getUTCDate()!=day || dt.getUTCMonth()!=month-1 || dt.getUTCFullYear()!=year)
		{
	        alert("\""+d+"\" is not a valid date!");
			obj.value = "";
			obj.focus();
        }
		var today = new Date();
		var age = ((today.getTime()-dt.getTime()) / (1000*60*60*24*365.25));
		if (age < 1 || age > 130)
		{
	        alert("The system doesn't allow ages under 1 or over 130");
			obj.value = "";
			obj.focus();
		}
        return(true);
	}
}

function letter(e)
{
	var evt = e ? e : event;
	var ch, chrCode = 0;

	if (evt.charCode!=null)     chrCode = evt.charCode;
	else if (evt.which!=null)   chrCode = evt.which;
	else if (evt.keyCode!=null) chrCode = evt.keyCode;

	if (chrCode==0) return "";
	return String.fromCharCode(chrCode);
}

function birthKeyPress(e)
{
	var ch = letter(e);
	if (((ch >= '0') && (ch <= '9')) || (ch == '-') || (ch == ''))
		e.returnValue = true;
	else
	{
		e.returnValue = false;
		if (!window.event) e.preventDefault();
	}
}

function empty(obj,fldname)
{
	var st = obj.value;
	st.replace(/^\s+|\s+$/g,"");
	if (st=="")
	{
		alert("\""+fldname+"\" can't be blank!");
		obj.focus();
		return true;
	}
	else
		return false;
}

function submitForm()
{
	if (!empty (document.frm.competitor,"name") &&
		!empty (document.frm.birth,"birthday") &&
		!empty (document.frm.country,"country") &&
		!empty (document.frm.gender,"gender"))
	{
		var req = createXMLHttpRequest();
		req.open ("GET", "addcompetitor.php?wcaid="+document.frm.WCAid.value+
										"&name="+document.frm.competitor.value+
										"&birthday="+document.frm.birth.value+ 
										"&country="+document.frm.country.value+ 
										"&gender="+document.frm.gender.value, 
										false);
		req.send (null);
		if (req.responseText != "")
			alert(req.responseText);
		else
			window.location.reload();
	}
	return false;
}

function updateData(spanId,url)
{
	var req = createXMLHttpRequest();
	req.open ("GET", url, false);
	req.send (null);
	//
	var txt = req.responseText;
	var i = txt.indexOf("/");
	if (i >= 0)
	{
		var spanId2 = txt.substring(i+1);
		document.getElementById(spanId2).innerHTML = "X";
		highlight(1,spanId2);
		txt = txt.substring(0,i);
	}
	if (txt=="") txt = "&nbsp;";
	document.getElementById(spanId).innerHTML = txt;
	highlight(0,spanId);
}

function toggleRegistration(compid,catid)
{
	updateData("td"+compid+"_"+catid,"toggleregistration.php?comp_id="+compid+"&cat_id="+catid);
}

var wdetails;

function openWDetails()
{
	if(wdetails && !wdetails.closed) wdetails.close(); 
	wdetails=window.open('', 'w_details', 'width=430, height=260, top='+((screen.availHeight-236)/2)+', left='+((screen.availWidth-426)/2)+', location=0, scrollbars=0, resizable=0'); 
}

</script>

<?
$order = NULL;
if ($_GET["order"])
{
	$order = $_GET["order"];
	$_SESSION["order"] = $order;
}
if (!$order) $order = $_SESSION["order"];
if (!$order) $order = "n";
$query = "SELECT $compstable.*, countries.name AS country FROM $compstable JOIN countries ON countries.id=$compstable.country_id ORDER BY ";
switch($order)
{
	case "i":
		$query .= "$compstable.id";
		break;
	case "b":
		$query .= "$compstable.birthday DESC"; 
		break;
	case "c":
		$query .= "countries.name, $compstable.name"; 
		break;
	case "g":
		$query .= "$compstable.gender, $compstable.name"; 
		break;
	default:
		$query .= "$compstable.name"; 
}
$result = strict_mysql_query($query);
$ncomps = mysql_num_rows($result);
?>

<table class=t_tabs><tr>
<td class=t_sel><a href='events.php'>EVENTS</a></td><td>COMPETITORS</td><td class=t_sel><a href='results.php'>RESULTS</a></td><td class=t_sel><a href='misc.php'>MISC</a></td>
</tr></table>

<table class=TH id=T_TH cellspacing=0>
<tr><th><div class=col_cl><?= $ncomps?columnHeader("id","i"):"" ?></div></th><th><div class=col_wi>WCA id</div></th><th><div class=col_nm><?=columnHeader("name","n")?></div></th><th><div class=col_bd><?=columnHeader("birthday","b")?></div></th><th><div class=col_ct><?=columnHeader("country","c")?></div></th><th><div class=col_gd><?=columnHeader("m/f","g")?></div></th>

<?
if (!$ncomps)
	echo "<th><div class=col_ot>&nbsp;</div></th></tr></table><SPAN id=container><table id=T_TD class=TD cellspacing=0><tr>";
else
{
	$closedevents = strict_mysql_query("SELECT id FROM $eventstable WHERE r2_open=TRUE");
	$closed = array();
	while ($row=cased_mysql_fetch_array($closedevents)) $closed[(int)$row["id"]] = true;
	//
	while ($rcat=cased_mysql_fetch_array($categories))
		echo "<th><div title=\"".$rcat["name"]."\" style='width:".$catwidth."px;'>".abbr($rcat["abbr"])."</div></th>";
	echo "<th><div class=col_ot>&nbsp;</div></th></tr></table><DIV><SPAN id=container><table id=T_TD class=TD cellspacing=0>";
	//
	$compHasTimesR1 = strict_mysql_query("SELECT DISTINCT CONCAT(cat_id,'_',comp_id) AS id FROM $timestable WHERE round=1");
	$compHTR1 = array();
	while ($row=cased_mysql_fetch_array($compHasTimesR1))
		$compHTR1[$row["id"]] = true;
	unset($compHasTimesR1);
	//
	while ($row=cased_mysql_fetch_array($result))
	{
		echo "<tr class=comprow_".(($count++) % 2?"odd":"even")."><td><div class=col_cl>" .$row["id"]. "</div></td><td><div class=col_wi>" .$row["WCAid"]. "</div></td><td><div class=col_nm><a href='editcomp.php?id=".$row["id"]."' target='w_details' title='click to edit details' onclick='openWDetails();'>" .$row["name"]. "</a></div></td><td><div class=col_bd>" .$row["birthday"]. "</div></td><td><div class=col_ct>" .$row["country"]. "</div></td><td><div class=col_gd align=center>" .$row["gender"]. "</div></td>";
		$candelete = true;
		if ($ncats)
		{
			mysql_data_seek($categories,0);
			while ($rcat=cased_mysql_fetch_array($categories))
			{
				if ($row["cat".$rcat["id"]]=="X" && isset($compHTR1[$rcat["id"]."_".$row["id"]]))
				{
					$candelete = false;
					echo "<td align=center><div style='width:".$catwidth."px;background-color:#9e9dba;'";
				}
				elseif ($closed[(int)$rcat["id"]]) 
					echo "<td align=center><div style='width:".$catwidth."px;background-color:#9e9dba;'";
				else
					echo "<td align=center><div style='cursor:pointer;width:".$catwidth."px;' id=td" .$row["id"]."_".$rcat["id"]. " onclick='toggleRegistration(\"" .$row["id"]. "\", \"" .$rcat["id"]. "\");'";
				echo ">".($row["cat".$rcat["id"]]!=""?$row["cat".$rcat["id"]]:"&nbsp;")."</div></td>";
			}
		}
		echo "<td><div class=col_ot><a href='timessheet.php?comp_id=" .$row["id"]. "' target=_blank>[cards]</a>".($candelete ? " <a style='cursor:pointer;' onclick='if (confirm(\"Remove " .$row["name"]. " from the competitors list?\")) callPage(\"delcompetitor.php?id=" .$row["id"]. "\");'>[delete]</a>" : "")."</div></td></tr>";
	}
}
?>

<tr style="background-color:white;">
<form name=frm onsubmit="return(submitForm());">
<td colspan=2><!--                                       width:118px=86+26+3+3px -->
<input type=text id=WCAid name=WCAid maxlength=10 style="width:118px;text-transform:uppercase;" onblur='validateWCAid(this);'></td>
<td><input type=text id=competitor name=competitor maxlength=50 style="width:200px;"></td>
<td><input type=text id=birth name=birth maxlength=10 onkeypress='birthKeyPress(event);' style="width:72px;" onblur='validateBirth(this)'></td>

<td><select id=country name=country style="width:100px;">
<option value=""></option>
<?
$result = strict_mysql_query("SELECT * FROM countries");
while ($row=cased_mysql_fetch_array($result))
{
	echo "<option value=\"" . $row["id"] . "\"";
	if ($row["id"]==$_SESSION["c_country"]) echo " selected";
	echo ">" . $row["name"] . "</option>\r\n";
}
?>
</select></td>

<td><select id=gender name=gender style="width:40px;">
<option value=""></option>
<option value="m">male</option>
<option value="f">female</option>
</select></td>
<?
if (!$ncomps)
{
	echo "<td class=col_ot colspan=".($ncats+1)."><input type=submit value=register>";
}
elseif ($ncats < 2)
{
	echo "<td colspan=".($ncats+1)."><input type=submit value=register>";
	if ($ncats) echo " <b>$ncomps</b> competitor".($ncomps==1?"":"s");
}
else
{
	echo "<td colspan=$ncats><input type=submit value=register>";
	echo "</td><td><b>$ncomps</b> competitor".($ncomps==1?"":"s");
}
?>
</form></td>
</tr></table>
</SPAN>

</body>
</html>

<?
mysql_close();
?>
