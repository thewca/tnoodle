<?
require_once "lib_ref.php";
require_once "lib_get.php";

$comp_id = _GET_num("comp_id");
$cat_id = _GET_num("cat_id");
$round = _GET_num("round");

if ($comp_id && $cat_id && $round)
{
        require_once "db.php";
        //
        strict_query("DELETE FROM $timestable WHERE cat_id=? AND round=? AND comp_id=?", array($cat_id,$round,$comp_id));
        //
        sql_close();
}
?>
