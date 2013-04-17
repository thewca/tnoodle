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
        if (sql_num_rows($result))
        {
                $event = cased_mysql_fetch_array($result);
                $round = 5;
                do {    
                        $round -= 1;
                } while($round > 1 && !$event["r".$round]);
                if ($round==1) die("Can't remove the first round");
                $rnd = "r".$round;
                if ($event[$rnd."_open"]) die("Can't remove an open round");
                strict_query("UPDATE $eventstable SET ". $rnd."=0, ". $rnd."_format=0, " .$rnd."_groupsize=0, " .$rnd."_open=0 WHERE id=?", array($_GETid));
        }
        //
        sql_close();
}
?>
