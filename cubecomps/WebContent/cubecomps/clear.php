<?
require_once "lib.php";
require_once "lib_ref_admin.php";
require_once "lib_get.php";

$cat_id = _GET_num("cat_id");
$round = _GET_num("round");

if ($cat_id && $round)
{
	require_once "db.php";
	//
	$event = strict_query("SELECT * FROM $eventstable WHERE id=?", array($cat_id));
	if (sql_num_rows($event) && cased_mysql_result($event,0,"r".$round) && cased_mysql_result($event,0,"r".$round."_open") && ($round==4 || !cased_mysql_result($event,0,"r".($round+1)) || !cased_mysql_result($event,0,"r".($round+1)."_open")))
	{
		if (sql_num_rows(strict_query("SELECT * FROM $timestable WHERE cat_id=? AND round=? LIMIT 1", array($cat_id,$round))))
			die("Can't clear this round: it has times");
		else
		{
			strict_query("DELETE FROM $regstable WHERE cat_id=? AND round=?", array($cat_id,$round));
			if ($round==1) strict_query("UPDATE $compstable SET cat?=\"-\" WHERE cat?=\"X\"", array($cat_id,$cat_id));
			strict_query("UPDATE $eventstable SET r?_open=0 WHERE id=?", array($round,$cat_id));
		}
	}
	//
	sql_close();
}
?>
