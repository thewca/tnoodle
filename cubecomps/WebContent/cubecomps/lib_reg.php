<?
require_once "lib.php";

function compHasTimesR1($comp_id,$cat_id)
{
        global $timestable;
        return sql_num_rows(strict_query("SELECT * FROM $timestable WHERE cat_id=? AND round=1 AND comp_id=?", array($cat_id,$comp_id)));
}

function toggleReg($comp_id,$cat_id)
{
        global $eventstable, $compstable, $regstable;
        $comp_id = (int)$comp_id;
        $cat_id = (int)$cat_id;
        $competitor = strict_query("SELECT cat? AS cat FROM $compstable WHERE id=?", array($cat_id,$comp_id));
        if(!sql_num_rows($competitor)) return "";
        $_X = "X"; // Do not change!
        $_w = "-"; //       "
        $event = strict_query("SELECT r1_open, r2_open, r1_groupsize FROM $eventstable WHERE id=?", array($cat_id));
        $groupsize = cased_mysql_result($event,0,"r1_groupsize");
        if (sql_num_rows($event) && !cased_mysql_result($event,0,"r2_open"))
        {
                if (cased_mysql_result($event,0,"r1_open"))
                {
                        $regs = strict_query("SELECT COUNT(*) as count FROM $regstable WHERE cat_id=? AND round=1", array($cat_id));
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
                                strict_query("INSERT INTO $regstable VALUES (?,1,?)", array($cat_id,$comp_id));
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
                                $waiting = strict_query("SELECT id FROM $compstable WHERE cat?='$_w' ORDER BY id LIMIT 1", array($cat_id));
                                if (!sql_num_rows($waiting))
                                        strict_query("DELETE FROM $regstable WHERE cat_id=? AND round=1 AND comp_id=?", array($cat_id,$comp_id));
                                else
                                {
                                        strict_query("UPDATE $compstable SET cat?='$_X' WHERE id=".cased_mysql_result($waiting,0,"id"), array($cat_id));
                                        strict_query("UPDATE $regstable SET comp_id='" .cased_mysql_result($waiting,0,"id"). "' WHERE cat_id=? AND round=1 AND comp_id=?", array($cat_id,$comp_id));
                                        $hl = "td".cased_mysql_result($waiting,0,"id")."_".$cat_id;
                                }
                        }
                }
                strict_query("UPDATE $compstable SET cat?='$newValue' WHERE id=?", array($cat_id,$comp_id));
                if ($hl) $newValue .= "/".$hl;
                return $newValue;
        }
}
?>
