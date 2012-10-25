<?
session_start();
include "lib_admin.php";
include "db.php";

$color = "#6b7b71";
$light_color = "#b0c7b4";
$dark_color = "#0a1414";

$test = preg_match("~^test\\.~i",$_SERVER["HTTP_HOST"]);
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
	body {background-color:<?=$color?>;}
	table {font-family:arial,sans-serif;font-size:12px;color:#2a3837;}
	a {color:black;font-weight:bold;text-decoration:none;}
	a:hover {color:#CCFF00;}
	.header {color:white;background-color:<?=$dark_color?>;font-size:14px;font-weight:bold;padding:4px 10px;margin-bottom:4px;}
	.topts td {background-color:<?=$light_color?>;}
	table.t_tabs {font-size:30px;border-style:none;color:#CCFF00;}
	table.t_tabs td {font-weight:bold;padding:0 20px;}
	td.t_sel:hover {background-color:<?=$light_color?>;}
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

var wupload = 0;

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
	if (!req.responseText.replace(/^[\s\r\n]+/,""))
		window.location.reload();
	else
		alert(req.responseText);
}

function clearBackground()
{
	callPage("delbg.php");
	location.reload();
}
</script>

<table class=t_tabs><tr>
<td class=t_sel><a href='events.php'>EVENTS</a></td><td class=t_sel><a href='competitors.php'>COMPETITORS</a></td><td class=t_sel><a href='results.php'>RESULTS</a></td><td>MISC</td>
</tr></table>

<table class=topts width=100% cellspacing=10 cellpadding=5 border=0 style='font-size:12px;'>
<tr valign=top>
<td>
<div class=header>Scorecards</div>

<table><tr>
<td>
<?
$filename = DIR_UPLOADS.($test?"test_":"")."bg_".$_SESSION["c_id"].".jpg";
if (file_exists($filename))
	echo "<img src='$filename' width=200 height=292>";
else
	echo "<div style='width:200px;height:292px;background-color:#FFFFFF;'></div>";
?>
</td>
<td width="100%" valign=top>

<div class=header>Upload background image</div>
<form action="uploadbg.php" target="w_upload" onsubmit="if(wupload && !wupload.closed) wupload.close(); wupload=window.open('', 'w_upload', 'width=200, height=20, location=0, scrollbars=0, resizable=0'); wupload.moveTo((screen.availWidth-200)/2,(screen.availHeight-20)/2);"  method="post" enctype="multipart/form-data">
<label for="file"><b>Filename</b></label>
<input type="file" name="file" id="file" />
<input type="submit" name="submit" value="Submit" />
<p>Only JPEG images of 100 Kb maximum. Regardless of the dimension and resolution of the uploaded file, the image will be stretched 95 mm width and 138.5 mm height in order to cover all the scorecard's background.
</form><p>
<div class=header>Clear background</div>
Click&nbsp;&nbsp;<input type=button value=clear onclick='clearBackground();'>&nbsp;&nbsp;to use a default white background.<p>

<?
$ofr = strict_mysql_query("SELECT id FROM $eventstable WHERE r1_open=1");
if (mysql_num_rows($ofr))
{
?>
<div class=header>All opened first round scorecards</div>
<form action="timessheet.php" target=_blank method="get"><input type=hidden name=aofr value=1>Get &nbsp;&nbsp;<input type=submit value='all scorecards'>&nbsp;&nbsp; for opened first rounds. <span style='font-size:10px;'>(NOTE: You should open rounds as soon as you can.)</span></form>
<?
}
?>

<div class=header>Blank scorecards</div>
<form action="timessheet.php" target=_blank method="get">Click to get a set of &nbsp;&nbsp;<input type=submit value='blank scorecards'></form>
</td>
</tr>
</table>

</td>
</tr><tr>
<td>
<div class=header>Reports</div>
<form action="extrarep.php" method="get" target=_blank>Get all the &nbsp;&nbsp;<input type=submit value='classifications'> (podiums, youngest and oldest competitors, fastest solve and fastest female)</form>
</td>
</tr><tr>
<td>
<div class=header>Exportation</div>
<?
//Get the &nbsp;&nbsp;<form action="xls.php" method="get" style="display:inline;"><input type=submit value='Competition Score Sheet (.XLSX file)'></form>&nbsp;&nbsp; or the &nbsp;&nbsp;<form action="sql.php" method="get" style="display:inline;"><input type=submit value='SQL file'></form>&nbsp;&nbsp;  to export data to the WCA.
?>
Get the &nbsp;&nbsp;<form action="xls.php" method="get" style="display:inline;"><input type=submit value='Competition Score Sheet (.XLSX file)'></form>&nbsp;&nbsp; to export data to the WCA.
</td>
</tr><tr>
<td>
<div class=header>Offline</div>
Use the <a href=offline.php target=_blank>offline feature</a> (opens in a separate window) to import a XLSX file filled offline.</td>
</tr><tr>
<td>
<div class=header>Live results</div>
<?
echo "Use the following link to give direct access to your live results: ";
if ($test)
	echo "<a href='http://test.".DOMAIN."/live.php?cid=".$_SESSION["c_id"]."' target=_blank>test.".DOMAIN."/live.php?cid=".$_SESSION["c_id"]."</a>";
else
	echo "<a href='http://live.".DOMAIN."/live.php?cid=".$_SESSION["c_id"]."' target=_blank>live.".DOMAIN."/live.php?cid=".$_SESSION["c_id"]."</a>";
?>
</td>
</tr><tr><td>
<div class=header>Reset all</div>
Only for situations in which you need to <a style='cursor:pointer;' onclick='obj=document.getElementById("resetall");obj.style.display=(obj.style.display=="none"?"block":"none");'>start from scratch</a>.
<div id='resetall' style='display:none;'><p>THIS PROCEDURE WILL DELETE EVERY PIECE OF INFORMATION AVAILABLE IN YOUR COMPETITION. Proceed only if you need to re-import your registration file over an empty database. Not suitable for any other situation!<br>
THIS OPERATION IS <U>NOT REVERSIBLE</u>.<p><form action='resetall.php' method='post'>Confirm the deletion with your administrative password:<input type=password name=pw><input type=submit value='reset all'></form>
<div>
</td>
</tr><tr><td>
<div class=header>Close connection</div>
<form action="logout.php" method="get">Click to &nbsp;&nbsp;<input type=submit value='logout'></form>
</td>
</tr></table>

</BODY>
</HTML>
