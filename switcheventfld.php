<?
include "lib_ref_admin.php";

if ($_GET["id"] && $_GET["fld"]) 
{
	include "db.php";
	//
	$result = mysql_query("SELECT * FROM $eventstable WHERE id=" . $_GET["id"]);
	if (mysql_num_rows($result)==1)
	{
		$fld = substr($_GET["fld"],strpos($_GET["fld"],"_"));
		switch ($fld)
		{
			case "_format":
				$formats = mysql_query("SELECT * FROM formats ORDER BY id");
				while($row=mysql_fetch_array($formats)) $fmts[] = $row["name"];
				$category = mysql_query("SELECT possible_formats FROM categories WHERE id=".mysql_result($result,0,"id"));
				$possible_formats = mysql_result($category,0,"possible_formats");
				$value = mysql_result($result,0,$_GET["fld"]);
				$newValue = (int)substr ($possible_formats, (strpos($possible_formats,"".$value)+1) % strlen($possible_formats), 1);
				mysql_query("UPDATE $eventstable SET " . $_GET["fld"] . "=" . $newValue . " WHERE id=" . $_GET["id"]);
				echo $fmts[$newValue-1];
				break;
		}
	}
	mysql_close();
}
?>