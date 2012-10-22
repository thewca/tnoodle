<?include "lib_ref_admin.php";
require_once "lib.php";

if ($_GET["cat_id"] && $_GET["round"])
{
	include "db.php";
	$cat_id = $_GET["cat_id"];
	$round = $_GET["round"];
	//
	$event = strict_mysql_query("SELECT * FROM $eventstable WHERE id=".$cat_id);
	if (mysql_num_rows($event) && cased_mysql_result($event,0,"r".$round) && !cased_mysql_result($event,0,"r".$round."_open"))
	{
		if ($round==1)
		{
			$comp_in = strict_mysql_query("SELECT id FROM $compstable WHERE cat".$cat_id."!='' ORDER BY id LIMIT " .cased_mysql_result($event,0,"r".$round."_groupsize"));
			$registered = mysql_num_rows($comp_in);
			if (!$registered) die("Cannot open this round: no one registered");
			for ($x=0;$x<$registered;$x++)
			{
				$result = strict_mysql_query("INSERT INTO $regstable VALUES (" .$cat_id. "," .$round. "," .cased_mysql_result($comp_in,$x,"id").")");
				$result = strict_mysql_query("UPDATE $compstable SET cat".$cat_id."='X' WHERE id=".cased_mysql_result($comp_in,$x,"id"));
			}
		}
		else
		{
			$timetype = cased_mysql_result(strict_mysql_query("SELECT timetype FROM categories WHERE id=".$cat_id),0,"timetype");
			$format = strict_mysql_query("SELECT * FROM formats WHERE id=".cased_mysql_result($event,0,"r".($round-1)."_format"));
			$avgtype = cased_mysql_result($format,0,"avgtype");
			$query =
				"SELECT $regstable.*, $timestable.average, $timestable.best FROM $regstable ".
				"JOIN $timestable ON ($regstable.cat_id=$timestable.cat_id AND $regstable.round=$timestable.round AND $regstable.comp_id=$timestable.comp_id) ".
				"WHERE $regstable.cat_id=" .$cat_id. " AND $regstable.round=" .($round-1)." AND $timestable.t1 IS NOT NULL AND $timestable.best<'A' ".
				"ORDER BY $timestable.average='', $timestable.average, $timestable.best";
			$list = strict_mysql_query($query);

			// bug - the following line is excluding competitors with all DNF from the total number of competitors
			// $ncomps = mysql_num_rows($list);
			// fix

			$query =
				  "SELECT COUNT(*) AS count FROM $timestable ".
				  "WHERE cat_id=" .$cat_id. " AND round=" .($round-1);

			$ncomps = mysql_result(mysql_query($query),0,"count");
				// fix end
  43	

			if (!$ncomps) die("Cannot open this round: no one qualified");
			$qualified = cased_mysql_result($event,0,"r".$round."_groupsize");
			$maxtoproceed = floor($ncomps*.75);
			if (!$maxtoproceed) die("Cannot open this round: not enough competitors");
			if ($maxtoproceed < $qualified)
			{
				$_SESSION["c_error"] = "WARNING!\\n\\nThere were $ncomps competitors in the previous round. $qualified were set to proceed, but according to regulations, only $maxtoproceed will proceed. Following rounds could also be affected by this change.";
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
					$result = strict_mysql_query("INSERT INTO $regstable VALUES (" .$cat_id. "," .$round. "," .$row["comp_id"]. ")");
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
			//$gsr1 = cased_mysql_result(strict_mysql_query("SELECT COUNT(*) AS count FROM $regstable WHERE cat_id=".$cat_id." AND round=1"),0,"count");
			$gsr1 = cased_mysql_result(strict_mysql_query("SELECT COUNT(*) AS count FROM $timestable WHERE cat_id=".$cat_id." AND round=1"),0,"count");
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
		$result = strict_mysql_query("UPDATE $eventstable SET $set WHERE id=".$cat_id);
	}
	//
	mysql_close();
}
?>
