<?
function compHasTimesR1($comp_id,$cat_id)
{
	global $timestable;
	return mysql_num_rows(mysql_query("SELECT * FROM $timestable WHERE cat_id=$cat_id AND round=1 AND comp_id=$comp_id"));
}

function toggleReg($comp_id,$cat_id)
{
	global $eventstable, $compstable, $regstable;
	$competitor = mysql_query("SELECT cat".$cat_id." AS cat FROM $compstable WHERE id=$comp_id");
	if (!$competitor || !mysql_num_rows($competitor)) return "";
	$_X = "X"; // Do not change!
	$_w = "-"; //       "
	$event = mysql_query("SELECT r1_open, r2_open, r1_groupsize FROM $eventstable WHERE id=$cat_id");
	$groupsize = mysql_result($event,0,"r1_groupsize");
	if (mysql_num_rows($event) && !mysql_result($event,0,"r2_open"))
	{
		if (mysql_result($event,0,"r1_open"))
		{
			$regs = mysql_query("SELECT COUNT(*) as count FROM $regstable WHERE cat_id=$cat_id AND round=1");
			$nregs = mysql_result($regs,0,"count");
		}
		else
			$nregs = $groupsize;
		if (!mysql_result($competitor,0,"cat"))
		{
			if ($nregs < $groupsize)
			{
				$newValue = $_X;
				mysql_query("INSERT INTO $regstable VALUES ($cat_id,1,$comp_id)");
			}
			else
				$newValue = $_w;
		}
		elseif (compHasTimesR1($comp_id,$cat_id)) 
			return $_X;
		else
		{
			$newValue = "";
			if (mysql_result($event,0,"r1_open") && mysql_result($competitor,0,"cat")==$_X)
			{
				$waiting = mysql_query("SELECT id FROM $compstable WHERE cat".$cat_id."=\"$_w\" ORDER BY id LIMIT 1");
				if (!mysql_num_rows($waiting))
					mysql_query("DELETE FROM $regstable WHERE cat_id=$cat_id AND round=1 AND comp_id=$comp_id");
				else
				{
					mysql_query("UPDATE $compstable SET cat".$cat_id."=\"$_X\" WHERE id=".mysql_result($waiting,0,"id"));
					mysql_query("UPDATE $regstable SET comp_id=\"" .mysql_result($waiting,0,"id"). "\" WHERE cat_id=$cat_id AND round=1 AND comp_id=$comp_id");
					$hl = "td".mysql_result($waiting,0,"id")."_".$cat_id;
				}
			}
		}
		mysql_query("UPDATE $compstable SET cat".$cat_id."=\"$newValue\" WHERE id=$comp_id");
		if ($hl) $newValue .= "/".$hl;
		return $newValue;
	}
}
?>