<?
require_once "lib.php";
function addEve($eve_id)
{
        $eve_id = (int)$eve_id;
        global $eventstable, $compstable;
        //
        $result = strict_query("SELECT id FROM $eventstable WHERE id=?", array($eve_id));
        if (sql_num_rows($result)) return;
        $result = strict_query("SELECT * FROM categories WHERE id=?", array($eve_id));
        if (sql_num_rows($result))
        {
                strict_query("INSERT INTO $eventstable SET id=?, r1=1, r1_format=" . substr(cased_mysql_result($result,0,"possible_formats"),0,1) . ", r1_groupsize=999", array($eve_id));
                strict_query("ALTER TABLE $compstable ADD cat? VARCHAR( 1 ) NOT NULL", array($eve_id));
        }
}
?>
