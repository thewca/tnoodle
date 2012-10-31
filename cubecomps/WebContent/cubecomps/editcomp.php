<?
require_once "lib.php";
require_once "lib_ref_admin.php";
require_once "db.php";

if (!$_GET["id"]) die("Invalid calling params!");
$comp = strict_mysql_query("SELECT * FROM $compstable WHERE id=".$_GET["id"]);
if (!mysql_num_rows($comp)) die("Competitor not found!");
$comp = cased_mysql_fetch_array($comp);

$color = "#6b7b71";
$light_color = "#b0c7b4";
$dark_color = "#0a1414";

?>
<html>
<head>
<TITLE>Edit competitor's details</TITLE>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<style type="text/css">
	body {font-family:arial,sans-serif;font-size:14px;background-color:<?=$color?>;}
	table {color:black;font-size:12px;-moz-box-shadow: 6px 6px 5px <?=$dark_color?>;-webkit-box-shadow: 6px 6px 5px <?=$dark_color?>; box-shadow: 6px 6px 5px <?=$dark_color?>;background-color:<?=$light_color?>;}
	td {padding:0 5px;}
	td.caption {color:#2a3837;text-align:right;}
</style>
</head>
<body onload='document.frm.WCAid.focus();'>

<script>

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

function submitForm()
{
	if (!empty (document.frm.competitor,"name") &&
		!empty (document.frm.birth,"birthday") &&
		!empty (document.frm.country,"country") &&
		!empty (document.frm.gender,"gender"))
	{
		var req = createXMLHttpRequest();
		req.open ("GET", "updcompetitor.php?id=<?=$_GET["id"]?>"+
										"&wcaid="+document.frm.WCAid.value+
										"&name="+document.frm.competitor.value+
										"&birthday="+document.frm.birth.value+ 
										"&country="+document.frm.country.value+ 
										"&gender="+document.frm.gender.value, 
										false);
		req.send (null);
		if (req.responseText.replace(/^[\s\r\n]+/,"") != "")
			alert(req.responseText);
		else
		{
			opener.location.reload();
			window.close();
		}
	}
	return false;
}

</script>

<table>
<tr><td colspan=2>&nbsp;</td></tr>
<tr><td class=caption>id</td><td><b><?=$comp["id"]?></b><td></tr>
<form name=frm onsubmit="return(submitForm());">
<tr><td class=caption>WCA id</td><td><input type=text id=WCAid name=WCAid maxlength=10 style="width:90px;text-transform:uppercase;" onblur='validateWCAid(this);' value="<?=$comp["WCAid"]?>"></td></tr>
<tr><td class=caption>name</td><td><input type=text id=competitor name=competitor maxlength=50 value="<?=$comp["name"]?>" style="width:300px;"></td></tr>
<tr><td class=caption>date of birth</td><td><input type=text id=birth name=birth maxlength=10 onkeypress='birthKeyPress(event);' onblur='validateBirth(this)' value="<?=$comp["birthday"]?>" style="width:80px;"></td></tr>
<tr><td class=caption>country</td><td><select id=country name=country style="width:200px;">
<option value=""></option>
<?
$result = strict_mysql_query("SELECT * FROM countries");
while ($row=cased_mysql_fetch_array($result))
{
	echo "<option value=\"" . $row["id"] . "\"";
	if ($row["id"]==$comp["country_id"]) echo " selected";
	echo ">" . $row["name"] . "</option>\r\n";
}
?>
</select></td></tr>
<tr><td class=caption>gender</td><td><select id=gender name=gender>
<option value=""></option>
<option value="m"<?=($comp["gender"]=="m"?" SELECTED":"")?>>male</option>
<option value="f"<?=($comp["gender"]=="f"?" SELECTED":"")?>>female</option>
</select></td></tr>
<tr><td colspan=2>&nbsp;</td></tr>
<tr><td><input type=button value=cancel onclick='window.close();'></td><td><input type=submit value=change></td></tr>
<tr><td colspan=2>&nbsp;</td></tr>

</form>
</table>

</body>
</html>
<?
mysql_close();
?>
