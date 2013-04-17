<?
require_once "lib_reg.php";
require_once "lib_ref_admin.php";
require_once "lib_get.php";

$comp_id = _GET_num("comp_id");
$cat_id = _GET_num("cat_id");

if ($comp_id && $cat_id) 
{
        require_once "db.php";
        echo toggleReg($comp_id,$cat_id);
        sql_close();
}
?>
