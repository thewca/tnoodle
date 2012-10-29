<?
function addCom_err($msg,$wcaid,$name,$importing)
{
	if ($importing)
	{
		$msg .= " (";
		if ($wcaid) $msg .= "$wcaid - ";
		$msg .= $name.")";
	}
	return $msg;
}

function addCom($wcaid,$name,$birthday,$country,$gender,$importing=false,$id=0)
{
	global $compstable;
	//
	$wcaid = strtoupper($wcaid);
	if ($wcaid && !preg_match("/^\d{4}[A-Z]{4}\d{2}$/",$wcaid))
		return addCom_err("Invalid WCA id format",$wcaid,$name,$importing);
	if (!checkdate((int)substr($birthday,5,2),(int)substr($birthday,8,2),(int)substr($birthday,0,4)))
		return addCom_err("Invalid date [$birthday]",$wcaid,$name,$importing);
	$gender = strtolower($gender);
	if ($gender!="f" && $gender!="m")
		return addCom_err("Invalid gender",$wcaid,$name,$importing);
	//
	if ($wcaid && !$id)
	{
		$result = strict_mysql_query("SELECT * FROM $compstable WHERE WCAid='$wcaid'");
		if (mysql_num_rows($result))
			return addCom_err("WCA id already exists",$wcaid,$name,$importing);
	}
	$result = strict_mysql_query("SELECT * FROM countries WHERE id='$country'");
	if (!mysql_num_rows($result))
		return addCom_err("Invalid country: ".$country,$wcaid,$name,$importing);
	if (!$id)
	{
		$result = strict_mysql_query("SELECT * FROM $compstable WHERE name='$name' AND country_id='$country' AND birthday='$birthday'");
		if (mysql_num_rows($result))
			return addCom_err("Competitor already inserted",$wcaid,$name,$importing);
	}
	//
	if ($id) {
		$result = strict_mysql_query("UPDATE $compstable SET WCAid='$wcaid', name='$name', country_id='$country', birthday='$birthday', gender='$gender' WHERE id=$id");
	} else {
		$result = strict_mysql_query("INSERT INTO $compstable SET WCAid='$wcaid', name='$name', country_id='$country', birthday='$birthday', gender='$gender'");
		if (!$result) {
			return addCom_err(mysql_error(),$wcaid,$name,$importing);
		}

	}
	//
	return ($id?(int)$id:mysql_insert_id());
}
?>
