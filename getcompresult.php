<?
require_once "lib.php";
require_once "lib_ref.php";
require_once "lib_get.php";

$comp_id = _GET_num("comp_id");
$cat_id = _GET_num("cat_id");
$round = _GET_num("round");

if ($comp_id && $cat_id && $round)
{
	require_once "db.php";
	//
	$qualified = sql_num_rows(strict_query("SELECT round FROM $regstable WHERE cat_id=? AND round=? AND comp_id=?", array($cat_id,$round,$comp_id)));
	if ($qualified)
	{
		$alreadyhastimes = sql_num_rows(strict_query("SELECT round FROM $timestable WHERE cat_id=? AND round=? AND comp_id=?", array($cat_id,$round,$comp_id)));
		$competitor = strict_query("SELECT name FROM $compstable WHERE id=?", array($comp_id));
		echo ($alreadyhastimes?"1":"0").cased_mysql_result($competitor,0,"name");
	}
	//
	sql_close();
}
?>
