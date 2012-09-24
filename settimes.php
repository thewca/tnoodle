<?
function timeNum($t,$type=NULL)
{
	if (!$t) die("ERROR: blank result");
	if ($t=="DNF" || $t=="DNS") return -1;
	global $timetype;
	if ($type===NULL) $type = $timetype;
	switch($type)
	{
	case 1:
		if (strlen($t)!=9) die("ERROR: time is not 9-char long (\"$t\")");
		$hh = (int)substr($t,7,2);
		$sec = (int)substr($t,4,2);
		if ($sec>=60) die("ERROR: illegal number of seconds (\"$t\")");
		$min = (int)substr($t,0,3);
		$hh = (($min*60)+$sec)*100+$hh;
		if ($timetype==3 && $hh>(60*60)*100) die("ERROR: time can't be over 60 minutes (\"$t\")");
		if ($hh==0) die("ERROR: time can't be zero (\"$t\")");
		return $hh;
		break;
	case 2:
		if (strlen($t)!=2) die("ERROR: moves is not 2-char long (\"$t\")");
		$moves = (int)$t;
		if ($timetype!=3)
		{
			if ($moves>80) die("ERROR: moves can't be over 80 (\"$t\")");
			if (!$moves) die("ERROR: moves can't be zero (\"$t\")");
		}
		return $moves;
		break;
	default:
		$a = timeNum(substr($t,0,2),2);
		$b = timeNum(substr($t,2,2),2);
		$c = timeNum(substr($t,4,9),1);
		if ($c < 0) return -1;
		if (!$b || $a>$b) die("ERROR: Invalid combination of solved and not solved cubes (\"$t\")");
		if ($a<$b/2) return -1;
		return ($c + (99-($a-($b-$a)))*6000000);
	}
}

function numTime($n)
{
	global $timetype;
	$n = round($n);
	switch($timetype)
	{
	case 1:
		$hh = $n % 100;
		$n = ($n-$hh)/100;
		$sec = $n % 60;
		$min = ($n-$sec)/60;
		return sprintf("%03d:%02d.%02d", $min,$sec,$hh);
		break;
	case 2:
		return sprintf("%02d", $n);
		break;
	default:
		die ("ERROR: not implemented yet");
	}
}

function getAverageAndBest(&$average,&$best)
{
	global 
		$times,$timetype,$avgtype,
		$timelimit, $tries, $cutpassed;
	//
	$average = 0;
	$dnfs = 0;
	if (!$timelimit)
		$timelimit_hh = 0;
	else
		$timelimit_hh = timeNum($timelimit);
	switch($timetype)
	{
	case 1:
		$b = timeNum("999:59.99") + 1;
		break;
	case 2:
		$b = timeNum("80") + 1;
		break;
	default:
		$b = timeNum("0102060:00.00") + 1;
	}
	$w = 0;
	for ($x=1;$x<=$times;$x++)
	{
		if ($x<=$tries || $cutpassed)
		{
			$t = timeNum($_GET["t$x"]);
			if ($t<0)
				$dnfs++;
			else
			{
				if ($t<$b) 
				{
					$b = $t;
					$bidx = $x;
				}
				if ($timetype!=3)
				{
					if ($t>$w) $w = $t;
					$average += $t;
				}
				if ($timelimit_hh && !$cutpassed && $t<$timelimit_hh) $cutpassed = true;
			}
		}
	}
	// set BEST
	if (!$cutpassed && ($dnfs==$tries))
		$best = "DNF";
	elseif ($dnfs==$times)
		$best = "DNF";
	else
		$best = $_GET["t$bidx"];
	// set AVERAGE
	switch($avgtype)
	{
	case 0: // average of 5
		if (!$cutpassed)
			$average = "";
		elseif ($dnfs>1)
			$average = "DNF";
		elseif ($dnfs==1)
			$average = numTime(($average-$b)/($times-2));
		else
			$average = numTime(($average-$b-$w)/($times-2));
		break;
	case 1: // mean of 3
		if (!$cutpassed)
			$average = "";
		elseif ($dnfs)
			$average = "DNF";
		else
			$average = numTime($average/$times);
		break;
	default: // best
		if ($timetype!=3)
			$average = "";
		elseif ($dnfs==$times)
			$average = "DNF";
		else
			$average = sprintf("%015d",$b); // trick to show results ordered
	}
}

include "lib_ref.php";

if ($_GET["comp_id"] && $_GET["cat_id"] && $_GET["round"])
{
	include "db.php";
	//
	$event = mysql_query("SELECT * FROM $eventstable WHERE id=".$_GET["cat_id"]);
	if (!mysql_num_rows($event) || !mysql_result($event,0,"r".$_GET["round"]."_open")) die("Round not open!");
	$qualified = mysql_query("SELECT round FROM $regstable WHERE cat_id=" .$_GET["cat_id"]. " AND round=" .$_GET["round"]. " AND comp_id=" .$_GET["comp_id"]);
	if (mysql_num_rows($qualified))
	{
		$category = mysql_query("SELECT * FROM categories WHERE id=".$_GET["cat_id"]);
		$timetype = mysql_result($category,0,"timetype");
		$format = mysql_query("SELECT * FROM formats WHERE id=".mysql_result($event,0,"r".$_GET["round"]."_format"));
		$times = mysql_result($format,0,"times");
		$avgtype = mysql_result($format,0,"avgtype");
		$alreadyhastimes = mysql_num_rows(mysql_query("SELECT round FROM $timestable WHERE cat_id=" .$_GET["cat_id"]. " AND round=" .$_GET["round"]. " AND comp_id=" .$_GET["comp_id"]));
		//
		if (mysql_result($category,0,"canhavetimelimit") && $_GET["round"]==1)
		{
			$timelimit = mysql_result($event,0,"timelimit");
			if($timelimit)
			{
				$timelimit = substr("000:00.00",0,9-strlen($timelimit)).$timelimit;
				if (!timeNum($timelimit,1)) $timelimit = "";
			}
		}
		else
			$timelimit = "";
		if($timelimit)
		{
			if ($times==5 || $_GET["cat_id"]==16)
				$tries = 2;
			else
				$tries = 1;
		}
		else
			$tries = $times;
		$cutpassed = ($timetype!=1 || $tries==$times);
		//
		getAverageAndBest($average,$best);
		for ($x=1;$x<=5;$x++)
		{
			if ($query) $query .= ", ";
			if ($x>$times || (!$cutpassed && $x>$tries))
				$query .= "t".$x."=\"\"";
			else
				$query .= "t".$x."=\"".$_GET["t".$x]."\"";
		}
		if (mysql_query(
			$alreadyhastimes ? 
			"UPDATE $timestable SET $query, average=\"$average\", best=\"$best\" WHERE cat_id=" .$_GET["cat_id"]. " AND round=" .$_GET["round"]. " AND comp_id=" .$_GET["comp_id"]
			:
			"INSERT INTO $timestable SET cat_id=" .$_GET["cat_id"]. ", round=" .$_GET["round"]. ", comp_id=" .$_GET["comp_id"].", $query, average=\"$average\", best=\"$best\""
			))
			echo "OK";
		else
			echo "ERROR: ".mysql_error();
	}
	//
	mysql_close();
}
?>