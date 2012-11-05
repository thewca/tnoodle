<?
require_once "lib.php";
require_once "lib_ref_admin.php";
require_once "db.php";

if (substr($_SERVER["REQUEST_URI"],0,6)=="/beta/")
	require_once "../".DIR_FPDF;
else
	require_once DIR_FPDF;

function formatTime($t,$type)
{
	if ($t=="") return "";
	if ($t=="DNF" || $t=="DNS") return $t;
	switch($type)
	{
	case 1:
		while(strlen($t)>4 && ((($ch=substr($t,0,1))=="0") || $ch==":")) $t = substr($t,1);
		return $t;
		break;
	case 2:
		if(strlen($t)>1 && substr($t,0,1)=="0") $t = substr($t,1);
		return $t;
		break;
	default:
		return formatTime(substr($t,0,2),2)."/".formatTime(substr($t,2,2),2)." ".formatTime(substr($t,4,9),1);
	}
}

function romance($st)
{
	return preg_replace("/\(.*\)/","",$st);
}

// $pdf = new FPDF();
$pdf = new tFPDF();
$pdf->SetAutoPageBreak(true,10);
/* new */ $pdf->AddFont('DejaVu','','DejaVuSans.ttf',true);
/* new */ $pdf->AddFont('DejaVu','B','DejaVuSans-Bold.ttf',true);

$pdf->AddPage();
// $pdf->SetFont('Arial','B',16);
$pdf->SetFont('DejaVu','B',16);
$pdf->Write(5,$_SESSION["c_name"]);
$pdf->Ln();
$pdf->SetFont('','',14);
$pdf->Write(5,"Podiums");
$pdf->Line(11,21,286.5,21);
$pdf->Ln(10);

$events = strict_query("SELECT $eventstable.*, name, timetype FROM $eventstable JOIN categories ON categories.id=$eventstable.id ORDER BY $eventstable.id");
while ($rowEvt=cased_mysql_fetch_array($events))
{
	$round = 4;
	while ($round > 1 && !$rowEvt["r".$round."_open"]) $round--;
	$format = strict_query("SELECT name, avgtype FROM formats WHERE id=".$rowEvt["r".$round."_format"]);
	$avgname = cased_mysql_result($format,0,"name");
	$avgtype = cased_mysql_result($format,0,"avgtype");
	$cat_id = $rowEvt["id"];
	$timetype = $rowEvt["timetype"];
	//
	$pdf->SetFont("","B",12);
	$pdf->Write(5,$rowEvt["name"]." Podium ($avgname)");
	$pdf->Ln();
	$pdf->SetFontSize(10);
	//
	$query =
		"SELECT $compstable.name, $timestable.average, $timestable.best ".
		"FROM $timestable ".
		"JOIN $compstable ON ($timestable.comp_id=$compstable.id) ".
		"WHERE $timestable.cat_id=$cat_id AND $timestable.round=$round ".
		"ORDER BY $timestable.average=\"\", $timestable.average, $timestable.best";
	$result = strict_query($query);
	$classification = 0;
	$count = 0;
	$qualified = 3;
	$lasta = "";
	$lastb = "";
	while ($classification<=$qualified && $row=cased_mysql_fetch_array($result))
	{
		$count++;
		if ($row["average"]!=$lasta || ($timetype!=3 && $row["best"]!=$lastb))
		{
			$classification = $count;
			$lasta = $row["average"];
			$lastb = $row["best"];
		}
		if ($row["best"] > "A") break;
		if ($classification && $classification<=$qualified) 
		{
			// $pdf->Write(5,$classification . ". " . UTF8transl($row["name"]) . " (" . formatTime($row[($avgtype==2?"best":"average")],$timetype) . ")");
			$pdf->Write(5,$classification . ". " . romance($row["name"]) . " (" . formatTime($row[($avgtype==2?"best":"average")],$timetype) . ")");
			$pdf->Ln();
		}
	}
	$pdf->Ln();
}

//----------------------------------------------------------------------------------------------------------------------------

$pdf->AddPage();
// $pdf->SetFont('Arial','B',16);
$pdf->SetFont('DejaVu','B',16);
$pdf->Write(5,$_SESSION["c_name"]);
$pdf->Ln();
$pdf->SetFont('','',14);
$pdf->Write(5,"Special classifications (for Rubik's Cube only)");
$pdf->Line(11,21,286.5,21);
$pdf->Ln(10);

$result = strict_query("SELECT $compstable.name, $compstable.birthday, countries.name AS country FROM $timestable JOIN $compstable ON $compstable.id=$timestable.comp_id JOIN countries ON $compstable.country_id=countries.id WHERE $timestable.cat_id=1 AND $timestable.best<'A' ORDER BY $compstable.birthday DESC LIMIT 1");
if (sql_num_rows($result))
{
	$pdf->SetFont("","B",12);
	$pdf->Write(5,"Youngest solver");
	$pdf->Ln();
	$pdf->SetFontSize(10);
	// $pdf->Write(5,UTF8transl(cased_mysql_result($result,0,"name")) . " - " . cased_mysql_result($result,0,"country") . " - " . cased_mysql_result($result,0,"birthday"));
	$pdf->Write(5,romance(cased_mysql_result($result,0,"name")) . " - " . cased_mysql_result($result,0,"country") . " - " . cased_mysql_result($result,0,"birthday"));
	$pdf->Ln(10);
}

$result = strict_query("SELECT $compstable.name, $compstable.birthday, countries.name AS country FROM $timestable JOIN $compstable ON $compstable.id=$timestable.comp_id JOIN countries ON $compstable.country_id=countries.id WHERE $timestable.cat_id=1 AND $timestable.best<'A' ORDER BY $compstable.birthday LIMIT 1");
if (sql_num_rows($result))
{
	$pdf->SetFont("","B",12);
	$pdf->Write(5,"Oldest solver");
	$pdf->Ln();
	$pdf->SetFontSize(10);
	// $pdf->Write(5,UTF8transl(cased_mysql_result($result,0,"name"))." - ".cased_mysql_result($result,0,"country")." - ".cased_mysql_result($result,0,"birthday"));
	$pdf->Write(5,romance(cased_mysql_result($result,0,"name"))." - ".cased_mysql_result($result,0,"country")." - ".cased_mysql_result($result,0,"birthday"));
	$pdf->Ln(10);
}

$result = strict_query("SELECT $compstable.name, countries.name AS country, $timestable.best FROM $timestable JOIN $compstable ON $compstable.id=$timestable.comp_id JOIN countries ON $compstable.country_id=countries.id WHERE $timestable.cat_id=1 ORDER BY $timestable.best LIMIT 1");
if (sql_num_rows($result))
{
	$pdf->SetFont("","B",12);
	$pdf->Write(5,"Fastest solve");
	$pdf->Ln();
	$pdf->SetFontSize(10);
	// $pdf->Write(5,UTF8transl(cased_mysql_result($result,0,"name"))." - ".cased_mysql_result($result,0,"country")." - ".formatTime(cased_mysql_result($result,0,"best"),1));
	$pdf->Write(5,romance(cased_mysql_result($result,0,"name"))." - ".cased_mysql_result($result,0,"country")." - ".formatTime(cased_mysql_result($result,0,"best"),1));
	$pdf->Ln(10);
}

$result = strict_query("SELECT $compstable.name, average, countries.name AS country FROM $compstable ".
	"JOIN (SELECT comp_id, MIN(average) AS average FROM $timestable WHERE cat_id=1 GROUP BY comp_id) avg ON avg.comp_id=$compstable.id ".
	"JOIN countries ON $compstable.country_id=countries.id ".
	"WHERE gender=\"f\" AND average!=\"\" ORDER BY average LIMIT 3");
if (sql_num_rows($result))
{
	$pdf->SetFont("","B",12);
	$pdf->Write(5,"Fastest females");
	$pdf->Ln();
	$pdf->SetFontSize(10);
	$count = 0;
	while ($row=cased_mysql_fetch_array($result))
	{
		// $pdf->Write(5,++$count.". ".UTF8transl($row["name"])." - ".$row["country"]." - ".formatTime($row["average"],1));
		$pdf->Write(5,++$count.". ".romance($row["name"])." - ".$row["country"]." - ".formatTime($row["average"],1));
		$pdf->Ln();
	}
}

$pdf->SetDisplayMode("fullpage","single");
$pdf->Output();

sql_close();
?>
