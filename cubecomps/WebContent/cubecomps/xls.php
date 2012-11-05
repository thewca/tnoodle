<?
require_once "lib.php";
require_once "db.php";
if (substr($_SERVER["REQUEST_URI"],0,6)=="/beta/")
	require_once "../".DIR_PHPEXCEL;
else
	require_once DIR_PHPEXCEL;
require_once "lib_ref_admin.php";

function formatTime($t,$timetype,$inseconds)
{
	if ($t=="" || $t=="DNF" || $t=="DNS") return $t;
	//
	if ($timetype==2) return (int)$t;
	//
	$min = (int)substr($t,0,3);
	$sec = (int)substr($t,4,2);
	$hh = (int)substr($t,7,2);
	if ($inseconds)
		return ($min*60)+$sec+$hh/100;
	else
		return ($min+($sec+($hh/100))/60)/1440;
}

function roundString($r,$nr,$c)
{
	switch($r)
	{
	case 1:
		if ($c)
			$st = "Combined ";
		else
			$st = "";
		if ($nr==1)
			$st .= "Final";
		else
		{
			$st .= "First";
			if (!$c) $st .= " Round";
		}
		break;
	case 2:
		if ($nr==2)
			$st = "Final";
		else
			$st = "Second Round";
		break;
	case 3:
		if ($nr==3)
			$st = "Final";
		else
			$st = "Semi Final";
		break;
	case 4:
		$st = "Final";
		break;
	}
	return $st;
}

function createSheetComps($sheet)
{
	global
		$events,
		$ssC,$ssB,$ssBC,
		$compstable, $timestable;
	//
	$result = strict_query(
		"SELECT $compstable.*, countries.name AS country ".
		"FROM $compstable ".
		"JOIN (SELECT DISTINCT comp_id FROM $timestable) AS tmp ON tmp.comp_id=$compstable.id ".
		"JOIN countries ON countries.id=$compstable.country_id ".
		"ORDER BY $compstable.name");
	$categories = strict_query("SELECT id, abbr FROM categories ORDER BY id");
	$abbrs = array();
	while ($row=cased_mysql_fetch_array($categories))
		$abbrs[$row["id"]] = $row["abbr"];
	//
	$sheet
		->setTitle("Registration");
	$sheet
		->setCellValue("A1", $_SESSION["c_name"])
		->setCellValue("A3", "#")
		->setCellValue("B3", "Name")
		->setCellValue("C3", "Country")
		->setCellValue("D3", "WCA id")
		->setCellValue("E3", "Gender")
		->setCellValue("F3", "Date of birth");
	for ($x=0;$x<sql_num_rows($events);$x++)
	{
		$sheet
			->setCellValue(chr(72+$x)."2", "=SUM(".chr(72+$x)."4:".chr(72+$x).(sql_num_rows($result)+3).")")
			->setCellValue(chr(72+$x)."3", $abbrs[cased_mysql_result($events,$x,"id")]);
	}
	$sheet
		->setSharedStyle($ssB, "A1")
		->setSharedStyle($ssB, "A3:F3")
		->setSharedStyle($ssBC, "G3:Z3");
	//
	$count = 0;
	while ($row=cased_mysql_fetch_array($result))
	{
		$count++;
		$sheet
			->setCellValue("A".($count+3), $count)
			->setCellValue("B".($count+3), $row["name"])
			->setCellValue("C".($count+3), $row["country"])
			->setCellValue("D".($count+3), $row["WCAid"])
			->setCellValue("E".($count+3), $row["gender"])
			->setCellValue("F".($count+3), $row["birthday"]);
		for ($x=0;$x<sql_num_rows($events);$x++)
			$sheet->setCellValue(chr(72+$x).($count+3), ($row["cat".cased_mysql_result($events,$x,"id")]?"1":"0"));
		$sheet
			->setSharedStyle($ssC, "G".($count+3).":Z".($count+3));
	}
	$sheet->getColumnDimension('B')->setWidth(20);
	$sheet->getColumnDimension('C')->setWidth(10);
	$sheet->getColumnDimension('D')->setWidth(15);
	$sheet->getColumnDimension('F')->setWidth(10);
}

function createSheetEvtRnd($sheet,$cat_id,$round,$lround,$timelimit)
{
	global
		$ssC,$ssB,$ssR,$ssTs,$ssTm,$ssBC,$ssBR,$ssBG1,$ssBG2,
		$compstable, $regstable, $timestable,
		$events,$evt, 
		$f_header,$f_headerc,$f_time;
	//
	$category = strict_query("SELECT * FROM categories WHERE id=".$cat_id);
	$timetype = cased_mysql_result($category,0,"timetype");
	$inseconds = cased_mysql_result($category,0,"inseconds");
	$format = strict_query("SELECT * FROM formats WHERE id=".cased_mysql_result($events,$evt,"r".$round."_format"));
	$times = cased_mysql_result($format,0,"times");
	$avgtype = cased_mysql_result($format,0,"avgtype");

	$query =
		"SELECT $regstable.*, $compstable.name, $compstable.WCAid, $timestable.t1, $timestable.t2, $timestable.t3, $timestable.t4, $timestable.t5, $timestable.average, $timestable.best, countries.name AS country FROM $regstable ".
		"JOIN $timestable ON ($regstable.cat_id=$timestable.cat_id AND $regstable.round=$timestable.round AND $regstable.comp_id=$timestable.comp_id) ".
		"JOIN $compstable ON ($regstable.comp_id=$compstable.id) ".
		"JOIN countries ON ($compstable.country_id=countries.id) ".
		"WHERE $regstable.cat_id=" .$cat_id. " AND $regstable.round=" .$round." ORDER BY $timestable.t1 IS NULL, $timestable.average=\"\", $timestable.average, $timestable.best, $regstable.comp_id";
	$result = strict_query($query);
	if (!sql_num_rows($result)) // trick to generate 32 empty lines with formulas
		$result = strict_query("SELECT NULL as name, NULL as country, NULL as WCAid, NULL as t1, NULL as t2, NULL as t3, NULL as t4, NULL as t5 FROM countries LIMIT 32");
	//
	$sheet
		->setTitle(cased_mysql_result($category,0,"abbr")."-".$round);
	$sheet
		//->setCellValue("A1", cased_mysql_result($category,0,"name")." - round $round")
		->setCellValue("A1", cased_mysql_result($category,0,"name")." - ".roundString($round,$lround,$timelimit))
		->setCellValue("A2", "Format: ".cased_mysql_result($format,0,"name"))
		->setCellValue("A3", ($timetype==2?"number of moves":($inseconds?"time in seconds (ss.hh)":"time in minutes (m:ss.hh)")))
		->setCellValue("A4", "Position")
		->setCellValue("B4", "Name")
		->setCellValue("C4", "Country")
		->setCellValue("D4", "WCA id");
	$sheet
		->setSharedStyle($ssB, "A1:A3")
		->setSharedStyle($ssB, "A4:D4");
	if ($timetype!=3)
	{
		if ($times==1)
		{
			$sheet->setCellValue("E4", "Result");
			$letterLT = "E";
			$letterBest = "E";
		}
		else
		{
			for ($x=1;$x<=$times;$x++)
				$sheet->setCellValue(chr(68+$x)."4", $x);
			$letterLT = chr(67+$x);
			$letterBest = chr(68+$x);
		}
		$sheet
			->setSharedStyle($ssBC, "E4:".chr(68+$times)."4")
			->setSharedStyle($ssBR, chr(69+$times)."4:Z4");
		$x = 69+$times;
	}
	else
	{	
		for ($x=1;$x<=$times;$x++)
			$sheet
				->setCellValue(chr(69+($x-1)*4)."4", "tried")
				->setCellValue(chr(69+($x-1)*4+1)."4", "solved")
				->setCellValue(chr(69+($x-1)*4+2)."4", "seconds")
				->setCellValue(chr(69+($x-1)*4+3)."4", "score $x");
		$sheet
			->setSharedStyle($ssBR, "E4:Z4");
		$x = 69+($x-1)*4;
	}
	if ($times>1) $sheet->setCellValue(chr($x++)."4", "Best");
	$sheet->setCellValue(chr($x++)."4", "WR");
	if ($avgtype==0)
	{
		$letterAvg = chr($x+1);
		$sheet
			->setCellValue(chr($x++)."4", "Worst")
			->setCellValue(chr($x++)."4", "Average")
			->setCellValue(chr($x++)."4", "WR");
	}
	elseif ($avgtype==1)
	{
		$letterAvg = chr($x);
		$sheet
			->setCellValue(chr($x++)."4", "Mean")
			->setCellValue(chr($x++)."4", "WR");
	}
	$line = 5;
	$lineb = 4;
	while ($row=cased_mysql_fetch_array($result))
	{
		$sheet
			->setCellValue("B$line", $row["name"])
			->setCellValue("C$line", $row["country"])
			->setCellValue("D$line", $row["WCAid"]);
		if ($timetype!=3)
		{
			for ($x=1;$x<=$times;$x++)
				$sheet->setCellValue(chr(68+$x).$line, formatTime($row["t$x"],$timetype,$inseconds));
			$x = 69+$times;
			if ($times>1) 
				$sheet
					->setCellValue(chr($x++).$line, "=IF(MIN(E$line:$letterLT$line)>0,MIN(E$line:$letterLT$line),IF(COUNTBLANK(E$line:$letterLT$line)=$times,\"\",\"DNF\"))");
			if ($avgtype==0)
			{
				$x++;
				$sheet
					->setCellValue(chr($x++).$line, "=IF(COUNTBLANK(E$line:I$line)>0,\"\",IF(COUNTIF(E$line:I$line,\"DNF\")+COUNTIF(E$line:I$line,\"DNS\")>0,\"DNF\",MAX(E$line:I$line)))")
					->setCellValue(chr($x++).$line, "=IF(COUNTBLANK(E$line:I$line)>0,\"\",IF(COUNTIF(E$line:I$line,\"DNF\")+COUNTIF(E$line:I$line,\"DNS\")>1,\"DNF\",IF(COUNTIF(E$line:I$line,\"DNF\")+COUNTIF(E$line:I$line,\"DNS\")>0,(SUM(E$line:I$line)-J$line)/".($times-2).",(SUM(E$line:I$line)-J$line-L$line)/".($times-2).")))");
			}
			elseif ($avgtype==1)
			{
				$x++;
				$sheet
					->setCellValue(chr($x++).$line, "=IF(COUNTBLANK(E$line:G$line)>0,\"\",IF(COUNTIF(E$line:G$line,\"DNF\")+COUNTIF(E$line:G$line,\"DNS\")>0,\"DNF\",AVERAGE(E$line:G$line)))"); 
			}
			if (isset($letterAvg))
				$sheet
					->setCellValue("A$line", "=IF(AND($letterAvg$lineb=$letterAvg$line,$letterBest$lineb=$letterBest$line),A$lineb,ROW()-4)");
			else
				$sheet
					->setCellValue("A$line", "=IF($letterBest$lineb=$letterBest$line,A$lineb,ROW()-4)");
			if ($timetype==2)
				$sheet->setSharedStyle($ssR, "E$line:Z$line");
			elseif ($inseconds)
				$sheet->setSharedStyle($ssTs, "E$line:Z$line");
			else
				$sheet->setSharedStyle($ssTm, "E$line:Z$line");
		}
		else
		{
			$formula = "";
			$formula_b = "";
			for ($x=1;$x<=$times;$x++)
			{
				if (!$row["t$x"] || $row["t$x"]=="DNF" || $row["t$x"]=="DNS")
					$sheet->setCellValue(chr(69+($x-1)*4).$line, $row["t$x"]);
				else
					$sheet
						->setCellValue(chr(69+($x-1)*4).$line, (int)substr($row["t$x"],2,2))
						->setCellValue(chr(69+($x-1)*4+1).$line, (int)substr($row["t$x"],0,2))
						->setCellValue(chr(69+($x-1)*4+2).$line, round(formatTime(substr($row["t$x"],4,9),1,true))); // Disagree with that "round"
				$lE = chr(69+($x-1)*4);
				$lF = chr(69+($x-1)*4+1);
				$lG = chr(69+($x-1)*4+2);
				$lH = chr(69+($x-1)*4+3);
				$sheet
					->setCellValue(chr(69+($x-1)*4+3).$line, "=IF($lE$line=\"DNS\",-2,IF($lE$line=\"DNF\",-1,(99-$lF$line+$lE$line-$lF$line)*10000000+$lG$line*100+$lE$line-$lF$line))") // Changed formula to suit my records (DNFs were discarded before)
					->setSharedStyle($ssBG1, chr(69+($x-1)*4+3).$line)
					->getColumnDimension(chr(69+($x-1)*4+3))->setWidth(10);
				if ($formula) $formula .= ",";
				$formula .= "IF($lH$line<0,1000000000,$lH$line)";
				if ($formula_b) $formula_b .= ",";
				$formula_b .= "$lH$line<0";
			}
			if ($times==1)
			{
				$sheet
					->setCellValue("A$line", "=IF(H$lineb=H$line,A$lineb,ROW()-4)");
			}
			else
			{
				$letterBest = chr(69+($x-1)*4);
				$sheet
					->setCellValue($letterBest.$line, "=IF(AND($formula_b),-1,MIN($formula))")
					->setCellValue("A$line", "=IF($letterBest$lineb=$letterBest$line,A$lineb,ROW()-4)")
					->setSharedStyle($ssBG2, $letterBest.$line)
					->getColumnDimension(chr(69+($x-1)*4))->setWidth(10);
			}
		}
		$line++;
		$lineb++;
	}
	$sheet->getColumnDimension('B')->setWidth(20);
	$sheet->getColumnDimension('C')->setWidth(10);
	$sheet->getColumnDimension('D')->setWidth(15);
}

// =========================== MAIN =====================================

$events = strict_query("SELECT * FROM $eventstable ORDER BY id");
$xlsx = new PHPExcel();
//-------- styles ----------
$ssC = new PHPExcel_Style();
$ssC->applyFromArray(
	array(
		'alignment' => array(
			'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_CENTER
		)
	)
);
$ssB = new PHPExcel_Style();
$ssB->applyFromArray(
	array(
		'font'	=> array(
			'bold'	  => true
		)
	)
);
$ssR = new PHPExcel_Style();
$ssR->applyFromArray(
	array(
		'alignment' => array(
			'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_RIGHT
		)
	)
);
$ssTs = new PHPExcel_Style();
$ssTs->applyFromArray(
	array(
		'alignment' => array(
			'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_RIGHT
		),
		'numberformat' => array(
			'code'    => '0.00'
		)
	)
);
$ssTm = new PHPExcel_Style();
$ssTm->applyFromArray(
	array(
		'alignment' => array(
			'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_RIGHT
		),
		'numberformat' => array(
			'code'    => 'm:ss.00'
		)
	)
);
$ssBC = new PHPExcel_Style();
$ssBC->applyFromArray(
	array(
		'font'    => array(
			'bold'      => true
		),
		'alignment' => array(
			'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_CENTER
		)
	)
);
$ssBR = new PHPExcel_Style();
$ssBR->applyFromArray(
	array(
		'font'    => array(
			'bold'      => true
		),
		'alignment' => array(
			'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_RIGHT
		)
	)
);
$ssBG1 = new PHPExcel_Style();
$ssBG1->applyFromArray(
	array(
		'fill'	=> array(
			'type'		=> PHPExcel_Style_Fill::FILL_SOLID,
			'color'		=> array('rgb' => 'FFCC99')
		)
	)
);
$ssBG2 = new PHPExcel_Style();
$ssBG2->applyFromArray(
	array(
		'fill'	=> array(
			'type'		=> PHPExcel_Style_Fill::FILL_SOLID,
			'color'		=> array('rgb' => 'CCCCFF')
		)
	)
);
//-------- competitors ----------
createSheetComps($xlsx->getActiveSheet());
//----------- events ------------
$l = sql_num_rows($events);
for ($evt=0;$evt<$l;$evt++)
{
	$lrnd = 4;
	while($lrnd>1 && !cased_mysql_result($events,$evt,"r$lrnd")) $lrnd--;
	$rnd = 1;
	//while($rnd <= 4 && cased_mysql_result($events,$evt,"r".$rnd."_open"))
	while($rnd <= $lrnd)
	{
		createSheetEvtRnd($xlsx->createSheet(),cased_mysql_result($events,$evt,"id"),
		$rnd,$lrnd,cased_mysql_result($events,$evt,"timelimit"));
		$rnd++;
	}
}

$fname = preg_replace("/\W/","",$_SESSION["c_name"]);
header("Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
header("Content-Disposition: attachment;filename=\"$fname.xlsx\"");
header("Cache-Control: max-age=0");
$objWriter = PHPExcel_IOFactory::createWriter($xlsx, 'Excel2007');
$objWriter->save('php://output');

sql_close();

?>
