<?
function addEve($eve_id)
{
	global $eventstable, $compstable;
	//
	$result = mysql_query("SELECT id FROM $eventstable WHERE id=".$eve_id);
	if (!$result || mysql_num_rows($result)) return;
	$result = mysql_query("SELECT * FROM categories WHERE id=".$eve_id);
	if (mysql_num_rows($result))
	{
		if (!mysql_query("INSERT INTO $eventstable SET id=$eve_id, r1=1, r1_format=" . substr(mysql_result($result,0,"possible_formats"),0,1) . ", r1_groupsize=999")) 
		{
			echo mysql_error();
			mysql_close();
			die();
		}
		
		if (!mysql_query("ALTER TABLE $compstable ADD cat".$eve_id." VARCHAR( 1 ) NOT NULL"))
		{
			echo mysql_error();
			mysql_close();
			die();
		}
	}
}
?>