<?
require_once "lib_ref_admin.php";
require_once "lib.php";
require_once "lib_get.php";

$cat_id = _GET_num("cat_id");
$round = _GET_num("round");

if ($cat_id && $round)
{
	require_once "db.php";
	//
	$event = strict_query("SELECT * FROM $eventstable WHERE id=?", array($cat_id));
	if (sql_num_rows($event) && cased_mysql_result($event,0,"r".$round) && !cased_mysql_result($event,0,"r".$round."_open"))
	{
		if ($round==1)
		{
			$comp_in = strict_query("SELECT id FROM $compstable WHERE cat?!='' ORDER BY id LIMIT " .cased_mysql_result($event,0,"r".$round."_groupsize"), array($cat_id));
			$registered = sql_num_rows($comp_in);
			if (!$registered) die("Cannot open this round: no one registered");
			for ($x=0;$x<$registered;$x++)
			{
				strict_query("INSERT INTO $regstable VALUES (?,?," .cased_mysql_result($comp_in,$x,"id").")", array($cat_id,$round));
				strict_query("UPDATE $compstable SET cat?='X' WHERE id=".cased_mysql_result($comp_in,$x,"id"), array($cat_id));
			}
		}
		else
		{
			$timetype = cased_mysql_result(strict_query("SELECT timetype FROM categories WHERE id=?", array($cat_id)),0,"timetype");
			$format = strict_query("SELECT * FROM formats WHERE id=".cased_mysql_result($event,0,"r".($round-1)."_format"));
			$avgtype = cased_mysql_result($format,0,"avgtype");
			$query =
				"SELECT $regstable.*, $timestable.average, $timestable.best FROM $regstable ".
				"JOIN $timestable ON ($regstable.cat_id=$timestable.cat_id AND $regstable.round=$timestable.round AND $regstable.comp_id=$timestable.comp_id) ".
				"WHERE $regstable.cat_id=? AND $regstable.round=? AND $timestable.t1 IS NOT NULL AND $timestable.best<'A' ".
				"ORDER BY $timestable.average='', $timestable.average, $timestable.best";
			$list = strict_query($query, array($cat_id,$round-1));

			// bug - the following line is excluding competitors with all DNF from the total number of competitors
			// $ncomps = sql_num_rows($list);
			// fix
			$query =
				"SELECT COUNT(*) AS count FROM $timestable ".
				"WHERE cat_id=? AND round=?";
			$ncomps = cased_mysql_result(strict_query($query, array($cat_id,$round-1)),0,"count");
			// fix end

			if (!$ncomps) die("Cannot open this round: no one qualified");
			$qualified = cased_mysql_result($event,0,"r".$round."_groupsize");
			$maxtoproceed = floor($ncomps*.75);
			if (!$maxtoproceed) die("Cannot open this round: not enough competitors");
			if ($maxtoproceed < $qualified)
			{
				$_SESSION["c_error"] = "WARNING!\\n\\nThere were $ncomps competitors in the previous round. $qualified were set to proceed, but according to regulations, only $maxtoproceed at most can proceed. Following rounds could also be affected by this change.";
				$qualified = $maxtoproceed;
			}
			$classification = 0;
			$registered = 0;
			$lasta = "";
			$lastb = "";
			while ($row=cased_mysql_fetch_array($list))
			{
				$registered++;
				if ($row["average"]!=$lasta || ($timetype!=3 && $row["best"]!=$lastb))
				{
					$classification = $registered;
					$lasta = $row["average"];
					$lastb = $row["best"];
				}
				if ($classification<=$qualified)
				{
					strict_query("INSERT INTO $regstable VALUES (?,?," .$row["comp_id"]. ")", array($cat_id,$round));
				} else
				{
					$registered--;
					break;
				}
			}
		}
		//
		$set = "r".$round."_open=1";
		if ($round==1)
			$gsr1 = $registered;
		else
			$gsr1 = cased_mysql_result(strict_query("SELECT COUNT(*) AS count FROM $timestable WHERE cat_id=? AND round=1", array($cat_id)),0,"count");
		if ($gsr1 <= 7)
			$maxrounds = 1;
		elseif ($gsr1 <= 15)
			$maxrounds = 2;
		elseif ($gsr1 <= 99)
			$maxrounds = 3;
		else
			$maxrounds = 4;
		for ($x=$round+1;$x<=4;$x++)
		{
			$registered = floor($registered*.75);
			if ($x>$maxrounds || $registered<2)
			{
				//if (cased_mysql_result($event,0,"r$round")) 
				if (cased_mysql_result($event,0,"r$x")) 
					$set .= ", r$x=0, r" .$x. "_format=0, r" .$x. "_groupsize=0, r" .$x. "_open=0";
				else
					break;
			}
			else
			{
				if (cased_mysql_result($event,0,"r".$x."_groupsize")>$registered)
					$set .= ", r".$x."_groupsize=$registered";
			}
		}
		strict_query("UPDATE $eventstable SET $set WHERE id=?", array($cat_id));
	}
	//
	sql_close();
}
?>
	