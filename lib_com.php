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
	$name = preg_replace("~[\\\\\"\;]~","",$name);
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
		$result = strict_query("SELECT * FROM $compstable WHERE WCAid=?", array($wcaid));
		if (sql_num_rows($result))
			return addCom_err("WCA id already exists",$wcaid,$name,$importing);
	}
	$result = strict_query("SELECT * FROM countries WHERE id=?", array($country));
	if (!sql_num_rows($result))
		return addCom_err("Invalid country: ".$country,$wcaid,$name,$importing);
	if (!$id)
	{
		$result = strict_query("SELECT * FROM $compstable WHERE name=? AND country_id=? AND birthday=?", array($name,$country,$birthday));
		if (sql_num_rows($result))
			return addCom_err("Competitor already inserted",$wcaid,$name,$importing);
	}
	//
	if ($id)
		strict_query("UPDATE $compstable SET WCAid=?, name=?, country_id=?, birthday=?, gender=? WHERE id=?", array($wcaid,$name,$country,$birthday,$gender,$id));
	else
		strict_query("INSERT INTO $compstable SET WCAid=?, name=?, country_id=?, birthday=?, gender=?", array($wcaid,$name,$country,$birthday,$gender));
	//
	return ($id?(int)$id:sql_insert_id());
}
?>
