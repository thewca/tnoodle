<?
require_once "lib.php";
require_once "lib_ref_admin.php";
require_once "lib_get.php";

$_GETid = _GET_num("id");

if ($_GETid) 
{
	require_once "db.php";
	//
	$result = strict_query("SELECT * FROM $eventstable WHERE id=?", array($_GETid));
	if (sql_num_rows($result)==1)
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
				$gs = sql_num_rows(strict_query("SELECT round FROM $regstable WHERE cat_id=? AND round=?", array($_GETid,$round-1)));
			else
				$gs = $event[$prnd."_groupsize"];
			$gs = floor($gs*.75);
			if ($gs >= 2)
			{
				strict_query("UPDATE $eventstable SET ". $rnd."=1, ". $rnd."_format=". $prnd."_format, " .$rnd."_groupsize=". $gs.", " .$rnd."_open=0 WHERE id=?", array($_GETid));
			}
		}
	}
	//
	sql_close();
}
?>
