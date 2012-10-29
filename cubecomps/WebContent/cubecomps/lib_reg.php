<?
require_once "lib.php";

function compHasTimesR1($comp_id,$cat_id)
{
	global $timestable;
	return mysql_num_rows(strict_mysql_query("SELECT * FROM $timestable WHERE cat_id=$cat_id AND round=1 AND comp_id=$comp_id"));
}

function toggleReg($comp_id,$cat_id)
{
	global $eventstable, $compstable, $regstable;
	$competitor = strict_mysql_query("SELECT cat".$cat_id." AS cat FROM $compstable WHERE id=$comp_id");
	if(!mysql_num_rows($competitor)) return "";
	$_X = "X"; // Do not change!
	$_w = "-"; //       "
	$event = strict_mysql_query("SELECT r1_open, r2_open, r1_groupsize FROM $eventstable WHERE id=$cat_id");
	$groupsize = cased_mysql_result($event,0,"r1_groupsize");
	if (mysql_num_rows($event) && !cased_mysql_result($event,0,"r2_open"))
	{
		if (cased_mysql_result($event,0,"r1_open"))
		{
			$regs = strict_mysql_query("SELECT COUNT(*) as count FROM $regstable WHERE cat_id=$cat_id AND round=1");
			$nregs = cased_mysql_result($regs,0,"count");
		}
		else
			$nregs = $groupsize;

		$hl = NULL;
		if (!cased_mysql_result($competitor,0,"cat"))
		{
			if ($nregs < $groupsize)
			{
				$newValue = $_X;
				$result = strict_mysql_query("INSERT INTO $regstable VALUES ($cat_id,1,$comp_id)");
			}
			else
				$newValue = $_w;
		}
		elseif (compHasTimesR1($comp_id,$cat_id)) 
			return $_X;
		else
		{
			$newValue = "";
			if (cased_mysql_result($event,0,"r1_open") && cased_mysql_result($competitor,0,"cat")==$_X)
			{
				$waiting = strict_mysql_query("SELECT id FROM $compstable WHERE cat".$cat_id."='$_w' ORDER BY id LIMIT 1");
				if (!mysql_num_rows($waiting))
					strict_mysql_query("DELETE FROM $regstable WHERE cat_id=$cat_id AND round=1 AND comp_id=$comp_id");
				else
				{
					$result = strict_mysql_query("UPDATE $compstable SET cat".$cat_id."='$_X' WHERE id=".cased_mysql_result($waiting,0,"id"));
					$result = strict_mysql_query("UPDATE $regstable SET comp_id='" .cased_mysql_result($waiting,0,"id"). "' WHERE cat_id=$cat_id AND round=1 AND comp_id=$comp_id");
					$hl = "td".cased_mysql_result($waiting,0,"id")."_".$cat_id;
				}
			}
		}
		$result = strict_mysql_query("UPDATE $compstable SET cat".$cat_id."='$newValue' WHERE id=$comp_id");
		if ($hl) $newValue .= "/".$hl;
		return $newValue;
	}
}
?>
