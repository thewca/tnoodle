<?
require_once "lib.php";
include "lib_ref_admin.php";

if ($_GET["id"]) 
{
	include "db.php";
	//
	$result = strict_mysql_query("SELECT * FROM $eventstable WHERE id=".$_GET["id"]);
	if (mysql_num_rows($result)==1)
	{
		$event = cased_mysql_fetch_array($result);
		$round = 0;
		do {	
			$round += 1;
		} while($round < 4 && $event["r".$round]);
		$rnd = "r".$round;
		if (!$event[$rnd])
		{
			$prnd = "r".($round-1);
			if ($event[$prnd."_open"])
				$gs = mysql_num_rows(strict_mysql_query("SELECT round FROM $regstable WHERE cat_id=".$_GET["id"]." AND round=".($round-1)));
			else
				$gs = $event[$prnd."_groupsize"];
			$gs = floor($gs*.75);
			if ($gs >= 2)
			{
				strict_mysql_query("UPDATE $eventstable SET ". $rnd."=1, ". $rnd."_format=". $prnd."_format, " .$rnd."_groupsize=". $gs.", " .$rnd."_open=0 WHERE id=" . $_GET["id"]);
			}
		}
	}
	//
	mysql_close();
}
?>
