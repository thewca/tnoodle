<?
require_once "lib_com.php";
require_once "lib_ref_admin.php";
require_once "lib_get.php";

$id = _GET_num("id");
$wcaid = _GET_fld("wcaid");
$name = _GET_name("name");
$birthday = _GET_birthday("birthday");
$country = _GET_fld("country");
$gender = _GET_fld("gender");

if ($id && isset($wcaid) && $name && $birthday && $country && $gender)
{
	require_once "db.php";
	$res = addCom ($wcaid,$name,$birthday,$country,$gender,false,$id);
	echo (is_int($res) ? "" : $res); 
	sql_close();
}
else
	echo "Incorrect parameters calling \"updcompetitor\"";
?>
