<?
require_once "lib.php";
require_once "lib_ref.php";
require_once "db.php";
require_once "lib_get.php";

function timelimitNum($t)
{
	if (!$t) return 0;
	$hh = (int)substr($t,7,2);
	$sec = (int)substr($t,4,2);
	$min = (int)substr($t,0,3);
	$hh = (($min*60)+$sec)*100+$hh;
	return $hh;
}

function formatTime($t,$type=NULL)
{
	global $print;
	if ($t=="") return ($print?"":"&nbsp;");
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

$openevents = strict_query("SELECT * FROM $eventstable WHERE r1_open=TRUE ORDER BY id");
$lastopenrounds = array();
$lastrounds = array();
$timelimited = array();
while ($row=cased_mysql_fetch_array($openevents))
{
	$timelimited[$row["id"]] = $row["timelimit"];
	$x = 4;
	while (!$row["r".$x]) $x--;
	$lastrounds[$row["id"]] = $x;
	while (!$row["r".$x."_open"]) $x--;
	$lastopenrounds[$row["id"]] = $x;
}

$cat_id = _GET_num("cat_id");
$round = _GET_num("round");
if ((!$cat_id || !$round) && count($lastopenrounds))
{
	if (!$cat_id) $cat_id = cased_mysql_result($openevents,0,"id");
	$round = $lastopenrounds[$cat_id];
}

if (@$_SESSION["c_admin"])
{
	$color = "#6b7b71";
	$light_color = "#b0c7b4";
	$dark_color = "#0a1414";
}
else
{
	$color = "#71758d";
	$light_color = "#9297b4";
	$dark_color = "#4c4f61";
}

if (!isset($lastopenrounds[$cat_id]) || $lastopenrounds[$cat_id]<$round)
{
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<TITLE><?=$_SESSION["c_name"]?></TITLE>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<style type="text/css">
	body {font-family:arial,sans-serif;font-size:14px;background-color:<?=$color?>;color:#FFFFCC;}
	a {color:black;font-weight:bold;text-decoration:none;}
	a:hover {color:#CCFF00;}
	table.t_tabs {font-size:30px;border-style:none;color:#CCFF00;}
	table.t_tabs td {font-weight:bold;padding:0 20px;}
	td.t_sel:hover {background-color:<?=$light_color?>;}
</style>
</head>
<body>
<?
	if (@$_SESSION["c_admin"])
	{
?>
<table class=t_tabs><tr><td class=t_sel><a href='events.php'>EVENTS</a></td><td class=t_sel><a href='competitors.php'>COMPETITORS</a></td><td>RESULTS</td><td class=t_sel><a href='misc.php'>MISC</a></td></tr></table>
<?
	}
	else
		echo "<br><br><br>";
?>
<H1><center>No rounds yet open!</center><H1>
</body>
</html>
<?
}
else
{
	$event = strict_query("SELECT * FROM $eventstable WHERE id=?", array($cat_id));
	$category = strict_query("SELECT * FROM categories WHERE id=?", array($cat_id));
	$timetype = cased_mysql_result($category,0,"timetype");
	if ($timetype==1)
		$coltimewidth = 60;
	elseif ($timetype==2)
		$coltimewidth = 30;
	else
		$coltimewidth = 100;
	//
	$format = strict_query("SELECT * FROM formats WHERE id=".cased_mysql_result($event,0,"r".$round."_format"));
	$times = cased_mysql_result($format,0,"times");
	$avgtype = cased_mysql_result($format,0,"avgtype");
	if (cased_mysql_result($category,0,"canhavetimelimit") && $round==1)
	{
		$timelimit = cased_mysql_result($event,0,"timelimit");
		if($timelimit) $timelimit = substr("000:00.00",0,9-strlen($timelimit)).$timelimit;
		if (!timelimitNum($timelimit)) $timelimit = "";
	}
	else
		$timelimit = "";
	if($timelimit)
	{
		if ($times==5 || $cat_id==16) // in x3bld too
			$tries = 2;
		else
			$tries = 1;
	}
	else
		$tries = $times;
	//
	$nrounds = 4;
	while ($nrounds>1 && !cased_mysql_result($event,0,"r$nrounds")) $nrounds--;
	//
	$print = (isset($_GET["print"]) && @$_SESSION["c_admin"]);
	IF (!$print)
	{
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<TITLE><?=$_SESSION["c_name"]?></TITLE>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<style type="text/css">
	body {font-family:arial,sans-serif;font-size:14px;background-color:<?=$color?>;color:#2a3837;}
	#container {display:inline-block;overflow-y:auto; overflow-x:hidden;}
	table.TH, table.TD {color:black;font-size:12px;}
	table.TH, #container {-moz-box-shadow: 6px 6px 5px <?=$dark_color?>;-webkit-box-shadow: 6px 6px 5px <?=$dark_color?>; box-shadow: 6px 6px 5px <?=$dark_color?>;}
	th {color:#2a3837;background-color:<?=$light_color?>;}
	a {color:black;font-weight:bold;text-decoration:none;}
	a:hover {color:#CCFF00;}
	table.t_tabs {font-size:30px;border-style:none;color:#CCFF00;}
	table.t_tabs td {font-weight:bold;padding:0 20px;}
	td.t_sel:hover {background-color:<?=$light_color?>;}
	.row_odd {background-color:#fff;}
	.row_odd:hover {background-color:#bbf;}
	.row_even {background-color:#ddd;}
	.row_even:hover {background-color:#bbf;}
	table {font-size:12px;color:black;}
	td, th {padding:0 3px;text-align:right;}
	.col_cl {width:26px;}
	.col_nm {width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-width:0 1px 0 0;border-style:solid;border-color:black;text-align:left;}
	.col_tm {width:<?= $coltimewidth ?>px;}
	.td_tm {border-width:0 1px 0 0;border-style:solid;border-color:black;}
	.col_ot {width:72px;text-align:left;}
	.is_sel, .is_nor {overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:pointer;}
	.is_sel {background:#bbf;}
	.is_nor:hover {background:#eef;}
</style>
</head>
<?
// if not printing...
		echo "<body onload='doResize();";
		if ($round!=$lastopenrounds[$cat_id])
			echo "alert(\"WARNING: this round is not the last one open in this event!\\r\\nChange existing results on your own risk.\");";
		// echo "' onresize='docResize();' onunload='if(I.changed) alert(\"Warning!\\r\\n\\nYour last changes are going to be discarded because you navigated off this page prior to submit them.\")'>\r\n<table class=t_tabs><tr><td style='font-size:20px;'>".cased_mysql_result($category,0,"name")." - round ".$round;
		echo "' onresize='docResize();' onunload='if(I.changed) alert(\"Warning!\\r\\n\\nYour last changes are going to be discarded because you navigated off this page prior to submit them.\")'>\r\n<table class=t_tabs><tr><td style='font-size:20px;'>".cased_mysql_result($category,0,"name")." - ".roundString($round,$nrounds,$timelimit);
		if ($timelimit) 
			if (@$_SESSION["c_admin"])
				echo "<br><center>cutoff ".formatTime($timelimit,1)."</center>";
			else
				echo " - cutoff ".formatTime($timelimit,1);
		echo "</td>";
		if (@$_SESSION["c_admin"])
			echo "<td class=t_sel><a style='cursor:pointer;' onclick='gotoPage(\"events.php\");'>EVENTS</a></td><td class=t_sel><a style='cursor:pointer;' onclick='gotoPage(\"competitors.php\");'>COMPETITORS</a></td><td>RESULTS</td><td class=t_sel><a style='cursor:pointer;' onclick='gotoPage(\"misc.php\");'>MISC</a></td>";
		echo "</tr></table>";
?>

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

function deleteTimes(cat_id,round,comp_id)
{
	var req = createXMLHttpRequest();
	req.open ("GET", "deltimes.php?cat_id="+cat_id+"&round="+round+"&comp_id="+comp_id, false);
	req.send (null);
	window.location.reload();
}

function quitEvent(cat_id,comp_id)
{
	var req = createXMLHttpRequest();
	req.open ("GET", "toggleregistration.php?cat_id="+cat_id+"&comp_id="+comp_id, false);
	req.send (null);
	var txt = req.responseText.replace(/[\s\r\n]+$/,"");
	if (txt && txt.substring(0,3)!="/td")
		alert ("Error found trying to remove this competitor from this event.\n("+txt+")");
	else
		window.location.reload();
}

<?
// if not printing...
		if ($timetype!=3)
		{
?>
function copyToEditor(id) // times & moves version
{
	if (I.changed && !confirm("Your last changes haven't been submitted yet.\r\nDiscard them?")) return;
	I.changed = false;
	id = id+"";
	I.inputs[0].buffer = "";
	I.activate(1);
	I.inputs[0].buffer = id;
	I.inputs[0].print();
	I.getCompResult(id,true);
	var obj;
	var x = 1;
	while ((obj=document.getElementById("res"+id+"_"+x)))
	{
		st = obj.innerHTML;
		st = st.replace(/\W/g,"");
		if (st=="nbsp")
			I.inputs[x].buffer = "";
		else if (st=="DNF")
			I.inputs[x].buffer = "D";
		else if (st=="DNS")
			I.inputs[x].buffer = "S";
		else		
			I.inputs[x].buffer = st;
		I.inputs[x].print();
		x++;
	}
	I.validate();
}
<?
		}
		else
		{
?>
function copyToEditor(id) // multi version
{
	if (I.changed && !confirm("Your last changes haven't been submitted yet.\r\nDiscard them?")) return;
	I.changed = false;
	id = id+"";
	I.inputs[0].buffer = "";
	I.activate(1);
	I.inputs[0].buffer = id;
	I.inputs[0].print();
	I.getCompResult(id,true);
	var obj;
	var x = 1;
	while ((obj=document.getElementById("res"+id+"_"+x)))
	{
		st = obj.innerHTML;
		I.inputs[((x-1)*3)+1].buffer = "";
		I.inputs[((x-1)*3)+2].buffer = "";
		if (st=="&nbsp;")
			I.inputs[((x-1)*3)+3].buffer = "";
		else if (st=="DNF")
			I.inputs[((x-1)*3)+3].buffer = "D";
		else if (st=="DNS")
			I.inputs[((x-1)*3)+3].buffer = "S";
		else		
		{
			var a = st.indexOf("/");
			var b = st.indexOf("&nbsp;");
			if (a<0 || b<0)
				I.inputs[((x-1)*3)+3].buffer = "";
			else
			{
				I.inputs[((x-1)*3)+1].buffer = st.substring(0,a);
				I.inputs[((x-1)*3)+2].buffer = st.substring(a+1,b);
				I.inputs[((x-1)*3)+3].buffer = st.substring(b+6).replace(/\W/g,"");
			}
		}
		I.inputs[((x-1)*3)+1].print();
		I.inputs[((x-1)*3)+2].print();
		I.inputs[((x-1)*3)+3].print();
		x++;
	}
	I.validate();
}
<?
		}
?>

function submitFrm(value)
{
	if(value)
	{
		if (I.changed && !confirm("Your last changes haven't been submitted yet.\r\nDiscard them?")) return;
		I.changed = false;
		document.forms["frm"].submit();
	}
}

function gotoPage(page)
{
	if (I.changed && !confirm("Your last changes haven't been submitted yet.\r\nDiscard them?")) return;
	I.changed = false;
	window.location = page; 
}

//----------------------------------- Incremental Search --------------------------------------------------

var ISStr = '';
var ISTop;
var ISLine;
var ISIdx;
<?
		$comp = strict_query("SELECT id, name FROM $regstable JOIN $compstable ON $regstable.comp_id=$compstable.id WHERE cat_id=? AND round=? ORDER BY name", array($cat_id,$round));
		$row = cased_mysql_fetch_array($comp);
		echo "var sList = [[". $row["id"]. ",'". htmlspecialchars($row["name"],ENT_QUOTES). "']";
		while ($row = cased_mysql_fetch_array($comp))
			echo ",[". $row["id"]. ",'". htmlspecialchars($row["name"],ENT_QUOTES). "']";
		echo "];\r\n";
?>

function ISClosed()
{
	return (oIS.style.display=="none");
}

function doIS()
{
	ISTop = 0;
	ISIdx = 0;
	document.getElementById("name").innerHTML = "";
	var result = "";
	var rexp = new RegExp(ISStr,"i");
	for (var x=0;x<sList.length;x++)
	{
		p = sList[x][1].search(rexp);
		if (p>=0) 
		{
			if (ISTop==5)
			{
				result += "<center>...</center>";
				break;
			}
			var st = sList[x][1];
			if (ISTop == ISLine)
			{
				document.getElementById("name").innerHTML = st;
				ISIdx = sList[x][0];
				result += "<div class=is_sel";
			}
			else
				result += "<div class=is_nor";
			result += " onclick='ISSelect("+sList[x][0]+");'>";
			st = st.substring(0,p+ISStr.length) + "</b>" + st.substring(p+ISStr.length);
			st = st.substring(0,p) + "<b>" + st.substring(p);
			result += st + "</div>";
			ISTop++;
		}
	}
	if (!result) result = "no matches...";
	//result += "<br>["+ISStr+"]";
	oIS.innerHTML = result;
	if (ISClosed())
	{
		I.inputs[0].buffer = "";
		I.inputs[0].allsel = true;
		I.inputs[0].print(true);
		I.validComp = false;
		I.validate();
		oIS.style.display = "block";
	}
}

function incSearch(ch)
{
	if (ISClosed()) ISStr = "";
	if (ch==null)
		ISStr = ISStr.substring(0,ISStr.length-1);
	else
		ISStr += ch.toUpperCase();
	ISLine = 0;
	doIS();
}

function closeIS(found)
{
	oIS.style.display = "none";
	if (!found) document.getElementById("name").innerHTML = "use <b>0..9</b> or <b>any letter</b>";
}

function backIS()
{
	var l = ISStr.length;
	if (l==1) 
		closeIS();
	else
		incSearch(null);
}

function ISGoTo(dx)
{
	if (ISTop)
	{
		ISLine = (ISLine + ISTop + dx) % ISTop;
		doIS();
	}
}

function ISPrevious()
{
	ISGoTo(-1);
}

function ISNext()
{
	ISGoTo(1);
}

function ISSelect(nidx)
{
	if (nidx) ISIdx = nidx;
	if (ISIdx)
	{
		closeIS(true);
		I.inputs[0].buffer = ISIdx+"";
		I.next();
	}
}

//-------------------------------------------------------

var T_COMP_ID = 0;
var T_TIME = 1;
var T_MOVES = 2;
var T_MULTI = 3;
var T_SUBMIT = 4;

var T_AVERAGE = 0;
var T_MEAN = 1;
var T_BEST = 2;

var T_TIMELIMIT_HH = <?=timelimitNum($timelimit)?>;

function letter(e)
{
	var evt = e ? e : event;
	var chrCode = 0;

	if (evt.charCode!=null)     chrCode = evt.charCode;
	else if (evt.which!=null)   chrCode = evt.which;
	else if (evt.keyCode!=null) chrCode = evt.keyCode;

	if (chrCode==0) return "";
	return String.fromCharCode(chrCode);
}

function key(evt)
{
	var chrCode = 0;

	if (evt.which!=null)        chrCode = evt.which;
	else if (evt.keyCode!=null) chrCode = evt.keyCode;

	return chrCode;
}

function docKP(e)
{
	I.letterCapture(letter(e));
}

function docKD(e)
{
	var evt = e ? e : event;
	//alert(key(evt));
	var prevent = true;
	switch(key(evt))
	{
	case 8:
		if (ISClosed())
			I.backspace();
		else
			backIS();
		break;
	case 9:
		if (evt.shiftKey)
			I.previous();
		else
			I.next();
		break;
	case 27:
		if (ISClosed())
			prevent = false;
		else
			closeIS();
		break;
	case 37:
	case 38:
		if (ISClosed())
			I.previous();
		else
			ISPrevious();
		break;
	case 13: // Don't move this up ;P
		if (!ISClosed())
		{
			ISSelect();
			break;
		}
		else if (I.active==I.count-1 && I.inputs[I.active].enabled)
		{
			I.submit();
			break;
		}
	case 39:
	case 40:
		if (ISClosed())
			I.next();
		else
			ISNext();
		break;
	case 46:
		I.del();
		break;
	default:
		prevent = false;
	}
	if (prevent)
	{
		if (window.event) 
			event.returnValue = false;
		else
			e.preventDefault();
	}
}

function HHtoStr(type,time)
{
	time = Math.round(time);
	switch(type)
	{
	case T_TIME:
		var hh = time % 100;
		time = (time-hh)/100;
		var sec = time % 60;
		var min = (time-sec)/60;
		hh = ""+hh;
		if (hh.length==1) hh = "0"+hh;
		if (!min)
			return sec+"."+hh;
		else
		{
			sec = ""+sec;
			if (sec.length==1) sec = "0"+sec;
			return min+":"+sec+"."+hh;
		}
		break;
	case T_MOVES:
		return ""+time;
		break;
	}
}

//---------------------------------------------------------------------

function Input(parent,idx,type,enabled)
{
	this.parent = parent;
	this.idx = idx;
	this.type = type;
	switch(type)
	{
	case T_COMP_ID:
		this.pattern = "000";
		this.maxvl = 3;
		this.acceptDNF = false;
		break;
	case T_TIME:
		this.pattern = "000:00.00";
		this.maxvl = 7;
		this.acceptDNF = true;
		break;
	case T_MOVES:
		this.pattern = "00";
		this.maxvl = 2;
		this.acceptDNF = true;
		break;
	}
	this.buffer = "";
	this.allsel = false;
	this.enabled = enabled;
	this.print();
}

Input.prototype.value = function()
{
	if (this.buffer=="D")
		return "DNF";
	else if (this.buffer=="S")
		return "DNS";
	else
	{
		var trans = "";
		var a = this.buffer.length-1;
		var b = this.pattern.length-1;
		while (b>=0) 		{
			if (this.pattern.charAt(b)=="0" && a>=0) 
				trans = this.buffer.charAt(a--) + trans;
			else
				trans = this.pattern.charAt(b) + trans;
			b--;
		}
		return trans;
	}
}

Input.prototype.print = function(hasFocus)
{
	var output = "<div style='color:white;background-color:"+(this.allsel?"red":"black")+";'>&nbsp;";
	var trans;
	if (this.type==T_SUBMIT)
		trans = (this.enabled?"submit":"<span style='color:#555;'>submit</span>");
	else
	{
		trans = this.value();
		if (!this.enabled)
			trans = "<span style='color:#555;'>"+trans+"</span>";
		else if (hasFocus) 
			trans = trans.substring(0,trans.length-1)+"<span style='background-color:red'>"+trans.charAt(trans.length-1)+"</span>";
	}
	output += trans;
	output += "&nbsp;</div>";
	document.getElementById((this.type==T_SUBMIT?"submit":"input"+this.idx)).innerHTML = output;
}

Input.prototype.getHH = function()
// returns	-2 for error
//			-1 for DNF or DNS
//			0 or above for real time or result
{
	if (this.buffer=="D" || this.buffer=="S") return -1;
	var l = this.buffer.length;
	if (!l) return 0;
	switch (this.type)
	{
	case T_TIME:
		var hh = parseInt(this.buffer.substring(l-2),10);
		if (l > 2) 
		{
			var sec = parseInt(this.buffer.substring(l-4,l-2),10);
			if (sec >= 60) return -2;
			hh += sec*100;
			if (l > 4) 
			{
				var min = parseInt(this.buffer.substring(0,l-4),10);
				hh += min*60*100;
			}
		}
		return hh;
	case T_MOVES:
		return parseInt(this.buffer,10);
	default:
		return -2;
	}
}

Input.prototype.validate = function()
{
	if (this.buffer!="" && this.buffer!="D" && this.buffer!="S")
		switch(this.type)
		{
		case T_TIME:
			var hh = this.getHH();
			if (hh < -1)
			{
				this.buffer = "";
				return false;
			}
			else if (this.parent.type==T_MULTI && hh>=360000) // 60*60*100
				this.buffer = "600000";
			else if (hh>=10*60*100)
			{
				var l = this.buffer.length;
				var hh = parseInt(this.buffer.substring(l-2),10);
				if (hh)
				{
					var sec = parseInt(this.buffer.substring(l-4,l-2),10);
					var min = parseInt(this.buffer.substring(0,l-4),10);
					if (hh>=50)
					{
						if (sec==59)
						{
							sec = 0;
							min++;
						}
						else
							sec++;
					}
					sec = sec+"";
					if (sec.length==1) sec = "0"+sec;
					this.buffer = min + sec + "00"; 
				}
			}
			break;
		case T_MOVES:
			if (this.parent.type!=T_MULTI && parseInt(this.buffer,10)>80) 
			{
				this.buffer = "";
				return false;
			}
			break;
		}
	if (this.parent.type==T_MULTI) this.parent.validateMulti(this.idx);
	return true;
}

//---------------------------------------------------------------------

function Inputs(type,solves,tries,avgtype)
{
	this.type = type;
	this.avgtype = avgtype;
	this.count = 0;
	this.inputs = new Array();
	this.active = -1;
	this.changed = false;
	this.validComp = false;
	this.tries = tries;
	this.cutpassed = (type!=T_TIME || solves==tries);
	document.onkeypress = docKP;
	document.onkeydown = docKD;
	//
	this.addInput(T_COMP_ID, true);
	if (this.type==T_MULTI)
	{
		while (solves--) 
		{
			tries--;
			this.addInput(T_MOVES, (tries>=0));
			this.addInput(T_MOVES, (tries>=0));
			this.addInput(T_TIME, (tries>=0));
		}
	}
	else
		while (solves--)
		{
			tries--;
			this.addInput(this.type, (tries>=0));
		}
	this.addInput(T_SUBMIT, false);
	this.activate(0);
}

Inputs.prototype.addInput = function(type,enabled)
{
	this.inputs[this.count] = new Input(this, this.count, type, enabled);
	this.count++;
}

Inputs.prototype.letterCapture = function(ch)
{
	with(this.inputs[this.active])
	{
		if (!enabled || type==T_SUBMIT) return;
		ch = ch.toUpperCase();
		if (!ISClosed())
		{
			if (ch>=" ") incSearch(ch);
		}
		else if (ch>="0" && ch<="9")
		{
			if (allsel)
			{
				allsel = false;
				buffer = "";
				this.changed = true;
			}
			if (buffer.length>0 || ch!="0")
			{
				buffer += ch;
				this.changed = true;
			}
			print(true);
			if (buffer.length==maxvl) this.next();
		}
		else if (acceptDNF && (ch=="D" || ch=="S" || ch=="/" || ch=="*") && (buffer=="" || allsel))
		{
			if (ch=="/") ch = "D";
			if (ch=="*") ch = "S";
			if (this.type==T_MULTI)
			{
				var x = (Math.floor((idx-1)/3)*3)+1;
				this.inputs[x].buffer = "";
				this.inputs[x].print();
				this.inputs[x+1].buffer = "";
				this.inputs[x+1].print();
				this.inputs[x+2].buffer = ch;
				this.inputs[x+2].print();
				this.activate(x+3);
			}
			else
			{
				buffer = ch;
				print(true);
				this.next();
			}
			this.changed = true;
		}
		else if (this.active==0 && ((ch>="A" && ch<="Z") || (ch>"¦")))
			incSearch(ch);	
		}
}

Inputs.prototype.del = function(ch)
{
	with(this.inputs[this.active])
	{
		if (!enabled || type==T_SUBMIT) return;
		buffer = "";
		allsel = true;
		this.changed = true;
		print(true);
	}
	this.validate();
}

Inputs.prototype.backspace = function(ch)
{
	with(this.inputs[this.active])
	{
		if (!enabled || type==T_SUBMIT) return;
		if (allsel)
		{
			allsel = false;
			buffer = "";
		}
		else
			buffer = buffer.substring(0,buffer.length-1);
		this.changed = true;
		print(true);
	}
}

Inputs.prototype.getCompResult = function(comp_id,copying)
{
	if (!ISClosed()) closeIS();
	var st = "";
	if (comp_id)
	{
		var req = createXMLHttpRequest();
		req.open ("GET", "getcompresult.php?comp_id="+comp_id+"&cat_id=<?=$cat_id?>&round=<?=$round?>", false);
		req.send (null);
		if (this.validComp=(req.responseText.length>0))
		{
			st = req.responseText.substring(1);
			if (req.responseText.charAt(0)=="1" && !copying)
				alert("WARNING: this competitor already has results in this round and event!");
		}
	}
	else
		this.validComp = false;
	document.getElementById("name").innerHTML = st;
}

Inputs.prototype.activate = function(idx)
{
	if (this.active==idx) return;
	if (this.active>=0)
		with(this.inputs[this.active])
		{
			if (!validate())
			{
				allsel = true;
				print(true);
				return;
			}
		}
	this.validate();
	if (!this.inputs[idx].enabled) return;
	if (this.active>=0)
		with(this.inputs[this.active])
		{
			allsel = false;
			print();
			if (!this.active)
			{
				this.getCompResult(buffer,false);
				this.validate();
				if (!this.inputs[idx].enabled) return;
			}
		}
	this.active = idx;
	this.inputs[this.active].allsel = true;
	this.inputs[this.active].print(true);
	if (!idx && !this.validComp) 
		document.getElementById("name").innerHTML = "use <b>0..9</b> or <b>any letter</b>";
}

Inputs.prototype.goTo = function(dx)
{
	if (!ISClosed()) closeIS();
	this.validate();
	var idx = this.active;
	do
		idx = (idx + this.count + dx) % this.count;
	while (!this.inputs[idx].enabled);
	this.activate(idx);
}

Inputs.prototype.previous = function()
{
	this.goTo(-1);
}

Inputs.prototype.next = function()
{
	this.goTo(+1);
}

Inputs.prototype.validateMulti = function(idx)
{
	if (idx==0 || idx==this.count-1) return;
	x = (Math.floor((idx-1)/3)*3)+1;
	var a = this.inputs[x].getHH();
	var b = this.inputs[x+1].getHH();
	var c = this.inputs[x+2].getHH();
	if (idx % 3 == 0)
	{
		if (c > b*60000) // 10*60*100
		{
			this.inputs[x+2].buffer = Math.min(b*10,60)+"0000";
			this.inputs[x+2].print();
		}
	}
	else if (b<a) 
	{
		this.inputs[x+1].buffer = ""+a;
		this.inputs[x+1].print();
	}
	else if (idx % 3 == 2 && a<b/2)
	{
		this.inputs[x].buffer = "";
		this.inputs[x].print();
		this.inputs[x+1].buffer = "";
		this.inputs[x+1].print();
		this.inputs[x+2].buffer = "D";
		this.inputs[x+2].print();
	}
}

Inputs.prototype.validate = function()
{
	var valid = true;
	var avg = 0;
	var best = 5999999; // = (((999*60)+59)*100)+99
	if (this.type==T_MULTI) best += 99*6000000;
	var worst = -1;
	var dnfs = 0;
	var cutpassed = (this.type!=T_TIME || this.tries==this.count-2);
	if (this.type==T_MULTI)
	{
		for (var x=1;x<this.count-1;x=x+3)
		{
			var time = this.inputs[x+2].getHH();
			if (time < -1 || !time)
				valid = false;
			else if (time < 0)
				dnfs++;
			else
			{
				var a = this.inputs[x].getHH();
				var b = this.inputs[x+1].getHH();
				if (!b || a>b)
					valid = false;
				else if (a < (b/2))
					dnfs++
				else
				{
					var total = time + (99-(a-(b-a)))*6000000;
					if (total<best) 
					{
						best = total;
						var bestMulti = a+"/"+b+" "+HHtoStr(T_TIME,time);
					}
				}
			}
		}
	}
	else
	{
		for (var x=1;x<this.count-1;x++)
		{
			if (x<=this.tries || cutpassed)
			{
				var time = this.inputs[x].getHH();
				if (time < -1 || !time)
					valid = false;
				else if (time < 0)
					dnfs++;
				else
				{
					avg += time;
					if (time<best) best = time;
					if (time>worst) worst = time;
					if (T_TIMELIMIT_HH && !cutpassed && time<T_TIMELIMIT_HH) cutpassed = true;
				}
			}
		}
	}
	//
	if (this.type==T_TIME && this.cutpassed!=cutpassed)
	{
		this.cutpassed = cutpassed;
		for (var x=this.tries+1;x<this.count-1;x++)
			if (cutpassed)
			{
				this.inputs[x].enabled = true;
				this.inputs[x].print();
			}
			else
			{
				this.inputs[x].enabled = false;
				this.inputs[x].buffer = "";
				this.inputs[x].print();
			}
	}
	//
	var obj_avg = document.getElementById("average");
	if (this.avgtype==T_BEST)
		obj_avg.innerHTML = "";
	else if (this.avgtype==T_AVERAGE)
	{
		if (!valid || !this.cutpassed)
			obj_avg.innerHTML = "average = ---";
		else if (dnfs>1)
			obj_avg.innerHTML = "average = DNF";
		else if (dnfs==1)
			obj_avg.innerHTML = "average = " + HHtoStr(this.type,(avg-best)/(this.count-4));
		else
			obj_avg.innerHTML = "average = " + HHtoStr(this.type,(avg-best-worst)/(this.count-4));
	}
	else
	{
		if (!valid || !this.cutpassed)
			obj_avg.innerHTML = "mean = ---";
		else if (dnfs)
			obj_avg.innerHTML = "mean = DNF";
		else
			obj_avg.innerHTML = "mean = " + HHtoStr(this.type, avg/(this.count-2));
	}
	//
	var obj_best = document.getElementById("best");
	if (!valid)
		obj_best.innerHTML = "best = ---";
	else if (!cutpassed && (dnfs==this.tries))
		obj_best.innerHTML = "best = DNF";
	else if ((this.type==T_MULTI && (dnfs == (this.count-2)/3)) || (this.type!=T_MULTI && (dnfs==this.count-2)))
		obj_best.innerHTML = "best = DNF";
	else if (this.type==T_MULTI)
		obj_best.innerHTML = "best = " + bestMulti;
	else
		obj_best.innerHTML = "best = " + HHtoStr(this.type,best);
	//
	valid = (valid && this.validComp);
	if (valid!=this.inputs[this.count-1].enabled)
	{
		this.inputs[this.count-1].enabled = valid;
		this.inputs[this.count-1].print();
	}
}

Inputs.prototype.submit = function()
{
	this.activate(this.count-1);
	if (this.inputs[this.count-1].enabled)
	{
		var url = "settimes.php?comp_id=" + parseInt(this.inputs[0].buffer,10) + "&cat_id=<?= $cat_id ?>&round=<?= $round ?>";
		if (this.type==T_MULTI)
			for (var x=1;x<this.count-1;x=x+3)
			{
				if (this.inputs[x+2].buffer=="D" || this.inputs[x+2].buffer=="S")
					url += "&t"+(((x-1)/3)+1)+"="+this.inputs[x+2].value();
				else
					url += "&t"+(((x-1)/3)+1)+"="+this.inputs[x].value()+this.inputs[x+1].value()+this.inputs[x+2].value();
			}
		else
			for (var x=1;x<this.count-1;x++)
				url += "&t"+x+"="+this.inputs[x].value();
		var req = createXMLHttpRequest();
		req.open ("GET", url, false);
		req.send (null);
		if (req.responseText.replace(/[\s\r\n]+$/,"")=="OK")
		{
			this.changed = false;
			window.location.reload();
		}
		else
			alert(req.responseText);
	}
}

Inputs.prototype.clear = function()
{
	for (var x=0;x<this.count-1;x++) 
	{
		this.inputs[x].buffer = "";
		this.inputs[x].print();
	}
	this.changed = false;
	this.validComp = false;
	this.cutpassed = (this.type!=T_TIME || this.tries==this.count-2);
	document.getElementById("name").innerHTML = "";
	this.validate();
	this.activate(0);
}

</script>

<TABLE>
<TR><TD valign=top>
<?
// if not printing...
		$moveswidth = 50;
		$timewidth = 156;
		$tablewidth = ($timetype==3 ? $timewidth+$moveswidth*2+12 : $timewidth);
?>
<table style='font-family:arial,sans serif; font-size:30px; width:<?=$tablewidth?>px; background-color:<?=$light_color?>; -moz-box-shadow: 6px 6px 5px <?=$dark_color?>;-webkit-box-shadow: 6px 6px 5px <?=$dark_color?>; box-shadow: 6px 6px 5px <?=$dark_color?>; padding:2px 0;'>
<tr><td id="input0" onclick="I.activate(0);" colspan=3>???</td></tr>
<tr><td style='height:20px;font-size:14px;' colspan=3>
<!-- name div -->
<div id=name style='overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:left;width:<?=$tablewidth?>px;'></div>
<!-- incremental search div -->
<div id=ISdiv style='position:fixed; width:200px; left:30px; background:white; border:2px solid <?=$color?>; font-size:12px; text-align:left;-moz-box-shadow: 6px 6px 5px <?=$dark_color?>;-webkit-box-shadow: 6px 6px 5px <?=$dark_color?>; box-shadow: 6px 6px 5px <?=$dark_color?>;padding:5px;display:none;'></div>
<!---------------------------->
</td></tr>

<?
// if not printing...
		if ($timetype==3)
		{
			echo "<tr>";
			for ($x=0;$x<$times;$x++)
			{
				echo "<tr>".
						"<td style='width:".$moveswidth."px;' id=\"input".($x*3+1)."\" onclick=\"I.activate(".($x*3+1).");\">???</td>".
						"<td style='width:".$moveswidth."px;' id=\"input".($x*3+2)."\" onclick=\"I.activate(".($x*3+2).");\">???</td>".
						"<td style='width:".$timewidth."px;' id=\"input".($x*3+3)."\" onclick=\"I.activate(".($x*3+3).");\">???</td>".
					"</tr>\r\n";	
			}
			echo "</tr>";
		}
		else 
		{
			for ($x=1;$x<=$times;$x++)
				echo "<tr><td style='width:".$timewidth."px;' id=\"input$x\" onclick=\"I.activate($x);\" colspan=3>???</td></tr>\r\n";	
		}
?>
<tr><td id="submit" onclick="I.submit();" colspan=3>???</td></tr>
<tr><td id="average" style="font-size:14px;" colspan=3>???</td></tr>
<tr><td id="best" style="font-size:14px;" colspan=3>???</td></tr>
</table>

<?
		if (@$_SESSION["c_admin"])
		{
?>
<br><div style='text-align:left;font-size:14px;'><a href='<?="results.php?cat_id=".$cat_id."&round=".$round."&print=1"?>' target=_blank'>[print]</a><div>

<?
		}
?>
<DIV style='color:white;text-align:left;font-size:12px;'>
<br><a style='cursor:pointer;' onclick='with(document.getElementById("keys").style) display=(display=="none"?"inline":"none");'>help?</a><br>
<div id=keys style='display:none;'><B>USE</B><br><div style='margin:0 0 0 10px;'><B>0..9</B> for results<br><B>D</B> (or <B>/</B>) for DNF<br><B>S</B> (or <B>*</B>) for DNS<br><B>Up</B>, <B>Down</B> & <b>Enter</b> to move</div>
<B>OMIT</B><div style='margin:0 0 0 10px;'><b>Any key else</b><br>including <B>.</B> and <B>:</B></div></div>

<?
		if (count($lastopenrounds)>1)
		{
			$categories = strict_query("SELECT id, name FROM categories");
			echo "<P><form name=frm action='results.php' method=get>";
			echo "<select name=cat_id style='width:170px;' onclick='submitFrm(this.value);'>";
			echo "<option value=''>Other rounds open...</option>";
			while ($rcat=cased_mysql_fetch_array($categories))
				if (isset($lastopenrounds[$rcat["id"]]) && ($rcat["id"]!=$cat_id || $lastopenrounds[$rcat["id"]]!=$round))
					// echo "<option value=".$rcat["id"].">".$rcat["name"]." - round ".$lastopenrounds[$rcat["id"]]."</option>";
					echo "<option value=".$rcat["id"].">".$rcat["name"]." - ". roundString($lastopenrounds[$rcat["id"]],$lastrounds[$rcat["id"]],$timelimited[$rcat["id"]]). "</option>";
			echo "</select><br>";
			echo "</form>";
		}
		
		if (!@$_SESSION["c_admin"])
		{
			echo "<br><br><br><a href='logout.php'>[logout]</a>";
		}
?>
</DIV>

</TD><TD valign=top>
<?
	} // end IF !$print

	IF (!$print)
	{
		if (@$_SESSION["c_admin"] && $round>1)
		{
?>
<script>
var wleft;
function openWLeft()
{
	if(wleft && !wleft.closed) wleft.close(); 
	wleft=window.open('', 'w_left', 'width=430, height=260, top='+((screen.availHeight-236)/2)+', left='+((screen.availWidth-426)/2)+', location=0, scrollbars=0, resizable=0'); 		
}
</script>
<?
		}

		echo "<table class=TH cellspacing=0 border=0>";
		echo "<tr><th><div class=col_cl>#</div></th><th><div class=col_cl>id</div></th><th><div style='width:201px;text-align:left;'>name</div></th>";
		for ($x=1;$x<=$times;$x++)
			echo "<th><div style='width:".($coltimewidth+1)."px;'>t$x</div></td>";
		switch($avgtype)
		{
		case 0:
			echo "<th><div style='width:".($coltimewidth)."px;'>average</div></th>";
			break;
		case 1:
			echo "<th><div style='width:".($coltimewidth)."px;'>mean</div></th>";
			break;
		}
		echo "<th><div style='width:".($coltimewidth)."px;'>best</div></th>";
		echo "<th><div class=col_ot></div></th>";
		echo "</tr></table><SPAN id=container><table id=T_TD class=TD cellspacing=0 border=0>";
	}

	$query =
		"SELECT $regstable.*, $compstable.name, $timestable.t1, $timestable.t2, $timestable.t3, $timestable.t4, $timestable.t5, $timestable.average, $timestable.best FROM $regstable ".
		"LEFT OUTER JOIN $timestable ON ($regstable.cat_id=$timestable.cat_id AND $regstable.round=$timestable.round AND $regstable.comp_id=$timestable.comp_id) ".
		"JOIN $compstable ON ($regstable.comp_id=$compstable.id) ".
		"WHERE $regstable.cat_id=? AND $regstable.round=? ORDER BY $timestable.t1 IS NULL, $timestable.average='', $timestable.average, $timestable.best, $compstable.name";
	$list = strict_query($query, array($cat_id,$round));
	$qualified = (
		$round<4 && cased_mysql_result($event,0,"r".($round+1)) ?
		cased_mysql_result($event,0,"r".($round+1)."_groupsize") :
		3
		);
	$classification = 0;
	$count = 0;
	$lasta = "";
	$lastb = "";
	IF (!$print)
	{
		while ($row=cased_mysql_fetch_array($list))
		{
			echo ($count++ % 2)?"<tr class=row_even>":"<tr class=row_odd>";
			if (!$row["t1"])
				$classification = "";
			elseif ($row["average"]!=$lasta || ($timetype!=3 && $row["best"]!=$lastb))
			{
				$classification = $count;
				$lasta = $row["average"];
				$lastb = $row["best"];
			}
			if ($qualified > 0) // Elegible to proceed?
			{
				if ($row["best"] > "A") $qualified = -1;
			}
			echo "<td";
			if ($classification && $classification<=$qualified) echo " style='background-color:#CCFF00;'";
			echo "><div class=col_cl><b>$classification</b></div></td><td><div class=col_cl>" .$row["comp_id"]. "</div></td><td><div class=col_nm><a style='cursor:pointer;' onclick='copyToEditor(".$row["comp_id"].")' title='click to copy results to the editor'>" .$row["name"]. "</a></div></td>";
			for ($x=1;$x<=$times;$x++)
				echo "<td class=td_tm><div id=res".$row["comp_id"]."_$x class=col_tm>".formatTime($row["t$x"])."</div></td>";
			if ($avgtype!=2) echo "<td><div style='width:".$coltimewidth."px;'><b>".formatTime($row["average"])."</b></div></td>";
			echo "<td><div style='width:".$coltimewidth."px;'>".($avgtype==2?"<b>":"").formatTime($row["best"]).($avgtype==2?"</b>":"")."</div></td>";
			if ($row["t1"]) 
				echo "<td><div class=col_ot><a onclick='if (confirm(\"Clear " .htmlspecialchars($row["name"],ENT_QUOTES). "&#39;s scores?\")) deleteTimes(" .$cat_id. "," .$round. "," .$row["comp_id"]. ");' style='cursor:pointer;'>[clear]</a></div></td>";
			elseif (@$_SESSION["c_admin"] && $round==1 && $round==$lastopenrounds[$cat_id])
				echo "<td><div class=col_ot><a onclick='if (confirm(\"Remove " .htmlspecialchars($row["name"],ENT_QUOTES). " from this event?\")) quitEvent(" .$cat_id. "," .$row["comp_id"]. ");' style='cursor:pointer;'>[quit]</a></div></td>";
			elseif (@$_SESSION["c_admin"] && $round>1 && $round==$lastopenrounds[$cat_id])
				echo "<td><div class=col_ot><a href='leaveevt.php?cat_id=$cat_id&round=$round&comp_id=". $row["comp_id"]. "' target='w_left' onclick='openWLeft();'>[miss]</a></div></td>";
			else
				echo "<td><div class=col_ot></div></td>";
			echo "</tr>";
		}
		echo "</table></SPAN>";
	}
	ELSE
	{
		if (substr($_SERVER["REQUEST_URI"],0,6)=="/beta/")
			require_once "../".DIR_FPDF;
		else
			require_once DIR_FPDF;
		//
		// class PDF extends FPDF
		class PDF extends tFPDF
		{
			function ClippingRect($x, $y, $w, $h, $outline=false)
			{
				$op=$outline ? 'S' : 'n';
				$this->_out(sprintf('q %.2f %.2f %.2f %.2f re W %s',
					$x*$this->k,
					($this->h-$y)*$this->k,
					$w*$this->k, -$h*$this->k,
					$op));
			}

			function UnsetClipping()
			{
				$this->_out('Q');
			}

			function ClippedCell($w, $h=0, $txt='', $border=0, $ln=0, $align='', $fill=0, $link='')
			{
				if($border || $fill /*|| $this->y+$h>$this->PageBreakTrigger*/)
				{
					$this->Cell($w, $h, '', $border, 0, '', $fill);
					$this->x-=$w;
				}
				$this->ClippingRect($this->x, $this->y, $w, $h);
				$this->Cell($w, $h, $txt, '', $ln, $align, 0, $link);
				$this->UnsetClipping();
			}
		}

		//
		$pdf = new PDF("L");
		$pdf->AddPage();
		$pdf->SetAutoPageBreak(true,10);
		/* new */ $pdf->AddFont('DejaVu','','DejaVuSans.ttf',true);
		/* new */ $pdf->AddFont('DejaVu','B','DejaVuSans-Bold.ttf',true);
		// $pdf->SetFont('Arial','B',16);
		$pdf->SetFont('DejaVu','B',16);
		$pdf->Write(5,$_SESSION["c_name"]);
		$pdf->Ln();
		$pdf->SetFont('','',14);
		$pdf->Write(5,cased_mysql_result($category,0,"name")." - round ".$round);
		//if (cased_mysql_result($event,0,"r".$round."_combined")) $pdf->Write(5," - combined");
		if ($timelimit) $pdf->Write(5," - cutoff (".formatTime($timelimit,1).")");
		$pdf->Line(11,21,286.5,21);
		$pdf->Ln(10);
		$coltimewidth = $coltimewidth/3;
		//
		$pdf->SetFont('','B',10);
		$pdf->Cell(8,5,"#",0,0,"R");
		$pdf->Cell(128,5,"name");
		for ($x=1;$x<=$times;$x++)
			$pdf->Cell($coltimewidth,5,"t$x",0,0,"R");
		$pdf->SetFont('','B',10);
		if ($avgtype!=2)
		{
			$pdf->Cell($coltimewidth,5,"average",0,0,"R");
			$pdf->SetFont('','',10);
		}
		$pdf->Cell($coltimewidth,5,"best",0,0,"R");
		$pdf->Ln(7);
		//
		while ($row=cased_mysql_fetch_array($list))
		{
			$count++;
			//echo ($count++ % 2)?"<tr class=row_even>":"<tr class=row_odd>";
			if (!$row["t1"])
				$classification = "";
			elseif ($row["average"]!=$lasta || ($timetype!=3 && $row["best"]!=$lastb))
			{
				$classification = $count;
				$lasta = $row["average"];
				$lastb = $row["best"];
			}
			if ($qualified > 0) // Elegible to proceed?
			{
				if ($row["best"] > "A") $qualified = -1;
			}
			if ($classification && $classification<=$qualified)
				$pdf->SetFillColor(204,255,0);
			else
				$pdf->SetFillColor(255);
			$pdf->SetFont('','',10);
			$pdf->Cell(8,5,$classification."",0,0,"R",true); // ."" is necessary; do not delete!
			$X = $pdf->GetX();
			$pdf->ClippedCell(128,5,str_repeat(". ",66),0,0,"",true);
			$pdf->SetX($X);
			// $name = UTF8transl($row["name"]);
			$name = preg_replace("/\(.*\)/","",$row["name"]);
			$X = min($pdf->GetStringWidth($name)+2,128);
			$pdf->ClippedCell($X,5,$name,0,0,"",true);
			$pdf->SetX(10+8+128);
			for ($x=1;$x<=$times;$x++)
				$pdf->Cell($coltimewidth,5,formatTime($row["t$x"]),0,0,"R",true);
			$pdf->SetFont('','B',10);
			if ($avgtype!=2)
			{
				$pdf->Cell($coltimewidth,5,formatTime($row["average"]),0,0,"R",true);
				$pdf->SetFont('','',10);
			}
			$pdf->Cell($coltimewidth,5,formatTime($row["best"]),0,0,"R",true);
			$pdf->Ln();
		}
		$pdf->SetDisplayMode("fullpage","single");
		$pdf->Output();
	}

	IF (!$print)
	{
?>
</TD></TR></TABLE>

<script>
var oIS = document.getElementById("ISdiv");
<?
		echo "I = new Inputs($timetype,$times,$tries,$avgtype);\r\n";
?>
</script>

</body>
</html>

<?
	} // end IF
}
sql_close();
?>
