<?
require_once "lib.php";
require_once "lib_reg.php";
require_once "lib_ref_admin.php";
require_once "lib_get.php";

$_GETid = _GET_num("id");

if ($_GETid)
{
        require_once "db.php";
        //
        if (sql_num_rows(strict_query("SELECT * FROM $timestable WHERE comp_id=?", array($_GETid)))) 
                die("Can't delete a competitor who already has results in the competition");
        $competitor = strict_query("SELECT * FROM $compstable WHERE id=?", array($_GETid));
        if (!sql_num_rows($competitor))
        {
                sql_close();
                die("Competitor id not found!");
        }
        $categories = strict_query("SELECT id FROM $eventstable");
        while ($rcat=cased_mysql_fetch_array($categories)) {
                if (cased_mysql_result($competitor,0,"cat".$rcat["id"])=="X") {
                        toggleReg($_GETid,$rcat["id"]);
                }
        }
        strict_query ("DELETE FROM $compstable WHERE id=?", array($_GETid));
        sql_close();
}
?>
