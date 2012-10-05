<?
require_once "lib.php;
/*
 * Ron asked me for this to be done, although it was never used.  It's an exportation of all the competition data in SQL.
 * The idea is skipping the XLSX file and go straight forward to the SQL text file that the Results Team is extracting currently
 * from the XLSX file (with great pain, I should say... :P ) It was rejected due to security reasons.
 *
 * But all in all, it's already done and I'd like to add it to the project.  There's a commented call in misc.php coming here.
 */
require_once "lib_ref_admin.php";
require_once "db.php";

function formatTime($t,$timetype)
{
	if ($t=="") return 0;
	if ($t=="DNF") return -1;
	if ($t=="DNS") return -2;
	//
	if ($timetype==2) return (int)$t;
	//
	if ($timetype==1)
	{
		$min = (int)substr($t,0,3);
		$sec = (int)substr($t,4,2);
		$hh = (int)substr($t,7,2);
		return (($min*60)+$sec)*100+$hh;
	}
	else
	{
		$solved = (int)substr($t,0,2);
		$attempted = (int)substr($t,2,2);
		$missed = $attempted-$solved;
		$difference = $solved-$missed;
		$time = floor(formatTime(substr($t,4,9),1) / 100);
		return sprintf("%02d%05d%02d", 99-$difference,$time,$missed);
	}
}

function roundString($r,$nr,$c, &$rId)
{
	switch($r)
	{
	case 1:
		if ($c)
			$st = "Combined ";
		else
			$st = "";
		if ($nr==1)
		{
			$st .= "Final";
			$rId = "f";
		}
		else
		{
			$st .= "First";
			if (!$c) $st .= " Round";
			$rId = "1";
		}
		break;
	case 2:
		if ($nr==2)
		{
			$st = "Final";
			$rId = "f";
		}
		else
		{
			$st = "Second Round";
			$rId = "2";
		}
		break;
	case 3:
		if ($nr==3)
		{
			$st = "Final";
			$rId = "f";
		}
		else
		{
			$st = "Semi Final";
			$rId = "s";
		}
		break;
	case 4:
		$st = "Final";
		$rId = "f";
		break;
	}
	return $st;
}

function createComps()
{
	global
		$compstable, $timestable;
	//
	$result = strict_mysql_query(
		"SELECT $compstable.*, countries.name AS country ".
		"FROM $compstable ".
		"JOIN (SELECT DISTINCT comp_id FROM $timestable) AS tmp ON tmp.comp_id=$compstable.id ".
		"JOIN countries ON countries.id=$compstable.country_id ".
		"ORDER BY $compstable.name");
	echo "-- Competitors\r\n";
	while ($row=cased_mysql_fetch_array($result))
	{
		$thisyear = date("Y");
		$d = getdate(strtotime($row["birthday"]));
		if ($d["year"]>1900 && $d["year"]<$thisyear-2)
	 		echo "update Persons set year=".$d["year"].",month=".$d["mon"].",day=".$d["mday"]." where name=\"".$row["name"]."\" and year=0 and countryId=\"".$row["country"]."\" limit 5;\r\n";
		echo "update Persons set gender=\"".$row["gender"]."\" where name=\"".$row["name"]."\" and gender=\"\" and countryId=\"".$row["country"]."\" limit 5;\r\n";
	}
	echo "\r\n\n";
}

function createEvtRnd($cat_id,$round,$lround,$timelimit)
{
	global
		$compstable, $regstable, $timestable,
		$events, $evt,
		$fname;
	//
	$formats = array(1=>"a",2=>"m",3=>"3",4=>"2",5=>"1");
	//
	$category = strict_mysql_query("SELECT * FROM categories WHERE id=".$cat_id);
	$timetype = cased_mysql_result($category,0,"timetype");
	$inseconds = cased_mysql_result($category,0,"inseconds");
	$format = strict_mysql_query("SELECT * FROM formats WHERE id=".cased_mysql_result($events,$evt,"r".$round."_format"));
	$times = cased_mysql_result($format,0,"times");
	$avgtype = cased_mysql_result($format,0,"avgtype");
	$formatId = $formats[cased_mysql_result($format,0,"id")];

	$query =
		"SELECT $regstable.*, $compstable.name, $compstable.WCAid, $timestable.t1, $timestable.t2, $timestable.t3, $timestable.t4, $timestable.t5, $timestable.average, $timestable.best, countries.name AS country FROM $regstable ".
		// people seem not to like this - "LEFT OUTER ".
		"JOIN $timestable ON ($regstable.cat_id=$timestable.cat_id AND $regstable.round=$timestable.round AND $regstable.comp_id=$timestable.comp_id) ".
		"JOIN $compstable ON ($regstable.comp_id=$compstable.id) ".
		"JOIN countries ON ($compstable.country_id=countries.id) ".
		"WHERE $regstable.cat_id=" .$cat_id. " AND $regstable.round=" .$round." ORDER BY $timestable.t1 IS NULL, $timestable.average=\"\", $timestable.average, $timestable.best, $regstable.comp_id";
	$result = strict_mysql_query($query);
	//

	echo "-- ".cased_mysql_result($category,0,"name")." - ".roundString($round,$lround,$timelimit, $rId)."\r\n";
	$lastA = "***";
	$lastB = "***";
	$count = 0;
	while ($row=cased_mysql_fetch_array($result))
	{
		$count++;
		echo "insert into Results (pos, personName, personId, countryId, competitionId, eventId, roundId, formatId, value1, value2, value3, value4, value5, best, average, regionalSingleRecord, regionalAverageRecord) values (";

		if ($row["average"]!=$lastA || $row["best"]!=$lastB) 
		{
			$position = $count;
			$lastA = $row["average"];
			$lastB = $row["best"];
		}
		echo "$position,";

		echo "\"".$row["name"]."\",";
		echo "\"".$row["WCAid"]."\",";
		echo "\"".$row["country"]."\",";
		echo "\"$fname\",";

		echo "\"".cased_mysql_result($category,0,"abbr")."\",";
		echo "\"$rId\",";
		echo "\"$formatId\",";

		for ($x=1;$x<=5;$x++)
			if ($x<=$times)
				echo formatTime($row["t$x"],$timetype).",";
			else
				echo "0,";

		echo formatTime($row["best"],$timetype).",";
		if ($formatId>"3")
			echo formatTime($row["average"],$timetype).",";
		else
			echo "0,";

		echo "\"\",\"\");\r\n";
	}
	echo "\r\n\n";
}

// =========================== MAIN =====================================

$fname = preg_replace("/\W/","",$_SESSION["c_name"]);
header("Content-Type: text/plain");
header("Content-Disposition: attachment;filename=\"$fname.sql\"");

//-------- competitors ----------
createComps();

//----------- events ------------
$events = strict_mysql_query("SELECT * FROM $eventstable ORDER BY id");
$l = mysql_num_rows($events);
for ($evt=0;$evt<$l;$evt++)
{
	$lrnd = 4;
	while($lrnd>1 && !cased_mysql_result($events,$evt,"r$lrnd")) $lrnd--;
	$rnd = 1;
	while($rnd <= 4 && cased_mysql_result($events,$evt,"r".$rnd."_open"))
	{
		createEvtRnd(cased_mysql_result($events,$evt,"id"), $rnd,$lrnd,cased_mysql_result($events,$evt,"timelimit"));
		$rnd++;
	}
}

mysql_close();

?>
