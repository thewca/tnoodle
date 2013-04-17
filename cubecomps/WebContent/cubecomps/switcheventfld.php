<?
require_once "lib.php";
require_once "lib_ref_admin.php";
require_once "lib_get.php";

$_GETid = _GET_num("id");
$_GETfld = _GET_fld("fld");

if ($_GETid && $_GETfld) 
{
        require_once "db.php";
        //
        $result = strict_query("SELECT * FROM $eventstable WHERE id=?", array($_GETid));
        if (sql_num_rows($result)==1)
        {
                $fld = substr($_GETfld,strpos($_GETfld,"_"));
                switch ($fld)
                {
                        case "_format":
                                $formats = strict_query("SELECT * FROM formats ORDER BY id");
                                while($row=cased_mysql_fetch_array($formats)) $fmts[] = $row["name"];
                                $category = strict_query("SELECT possible_formats FROM categories WHERE id=".cased_mysql_result($result,0,"id"));
                                $possible_formats = cased_mysql_result($category,0,"possible_formats");
                                $value = cased_mysql_result($result,0,$_GETfld);
                                $newValue = (int)substr ($possible_formats, (strpos($possible_formats,"".$value)+1) % strlen($possible_formats), 1);
                                strict_query("UPDATE $eventstable SET $_GETfld=$newValue WHERE id=?", array($_GETid));
                                echo $fmts[$newValue-1];
                                break;
                }
        }
        sql_close();
}
?>
