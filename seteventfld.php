<?
include "lib_ref_admin.php";

function timelimitNum00($t)
{
	if (!$t) return 0;
	$t = substr("000:00.00",0,9-strlen($t)).$t;
	// $hh = 0; // !
	$hh = (int)substr($t,7,2);
	$sec = (int)substr($t,4,2);
	$min = (int)substr($t,0,3);
	$hh = (($min*60)+$sec)*100+$hh;
	return $hh;
}

function formatTimelimit00($t)
{
	if (preg_match("/^[0-9]{1,2}\072[0-5][0-9]$/",$t)) $t .= ".00";
	while(strlen($t)>4 && ((($ch=substr($t,0,1))=="0") || $ch==":")) $t = substr($t,1);
	$l = strlen($t);
	if ($l>4) $t = substr($t,0,$l-2)."00";
	return $t;
}

if ($_GET["id"] && $_GET["fld"] && isset($_GET["value"])) 
{
	include "db.php";
	//
	$value = $_GET["value"];
	if ($_GET["fld"]=="timelimit")
	{
		if ($value && !preg_match("/^([0-9]{1,2}\072[0-5][0-9]\056[0-9]{2}|[0-5]?[0-9]\056[0-9]{2}|[0-9]{1,2}\072[0-5][0-9])$/",$value))
			$value = "";
		if ($value)
		{
			$value = formatTimelimit00($value);
			if (!timelimitNum00($value)) $value = "";
		}
	}
	//
	mysql_query("UPDATE $eventstable SET " . $_GET["fld"] . "=\"$value\" WHERE id=" . $_GET["id"]);
	//
	if ($_GET["fld"]=="timelimit")
		if ($value)
			$value = "cutoff $value";
		else
			$value = "no cutoff";
	echo $value;
	//
	mysql_close();
	//$_SESSION["hl"] = $_GET["hl"];
}
?>