<?
include "lib_ref_admin.php";

if ($_GET["id"]) 
{
	include "db.php";
	//
	$result = mysql_query("SELECT * FROM $eventstable WHERE id=".$_GET["id"]);
	if (mysql_num_rows($result))
	{
		$event = mysql_fetch_array($result);
		$round = 5;
		do {	
			$round -= 1;
		} while($round > 1 && !$event["r".$round]);
		if ($round==1) die("Can't remove the first round");
		$rnd = "r".$round;
		if ($event[$rnd."_open"]) die("Can't remove an open round");
		mysql_query("UPDATE $eventstable SET ". $rnd."=0, ". $rnd."_format=0, " .$rnd."_groupsize=0, " .$rnd."_open=0 WHERE id=" . $_GET["id"]);
	}
	//
	mysql_close();
}
?>