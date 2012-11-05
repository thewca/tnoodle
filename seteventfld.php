<?
require_once "lib_ref_admin.php";
require_once "lib_get.php";

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

$_GETid = _GET_num("id");
$_GETfld = _GET_fld("fld");

if ($_GETid && $_GETfld && isset($_GET["value"])) 
{
	require_once "db.php";
	//
	if ($_GETfld=="timelimit")
	{
		$value = _GET_key("value"); // still secure because of the following lines
		if ($value && !preg_match("/^([0-9]{1,2}\072[0-5][0-9]\056[0-9]{2}|[0-5]?[0-9]\056[0-9]{2}|[0-9]{1,2}\072[0-5][0-9])$/",$value))
			$value = "";
		if ($value)
		{
			$value = formatTimelimit00($value);
			if (!timelimitNum00($value)) $value = "";
		}
	}
	else
		$value = _GET_num("value");
	//
	strict_query("UPDATE $eventstable SET $_GETfld=? WHERE id=?", array($value,$_GETid));
	//
	if ($_GETfld=="timelimit")
		if ($value)
			$value = "cutoff $value";
		else
			$value = "no cutoff";
	echo $value;
	//
	sql_close();
}
?>
