<?      
require_once "lib.php"
include "lib_ref_admin.php";
include "db.php";

if (substr($_SERVER["REQUEST_URI"],0,6)=="/beta/")
	include "../".DIR_FPDF;
else
	include DIR_FPDF;

class TS extends tFPDF
{
	var $column;
	var $row;
	var $fname;

	function __construct()
	{
		parent::__construct();
		$this->column = false;
		$this->row = false;
		$test = preg_match("~(^test\056|//test\056)~i",$_SERVER["HTTP_HOST"]);
		$this->fname = DIR_UPLOADS.($test?"test_":"")."bg_".$_SESSION["c_id"].".jpg";
	}

	function ClippingRect($x, $y, $w, $h, $outline=false)
    {
        $op=$outline ? 'S' : 'n';
        $this->_out(sprintf('q %.2f %.2f %.2f %.2f re W %s',
            $x*$this->k,
            ($this->h-$y)*$this->k,
            $w*$this->k, -$h*$this->k,
            $op));
    }

	function UnsetClipping()
    {
        $this->_out('Q');
    }

	function AcceptPageBreak()
	{
		return false;
	}

    function ClippedCell($w, $h=0, $txt='', $border=0, $ln=0, $align='', $fill=0, $link='')
    {
        if($border || $fill /*|| $this->y+$h>$this->PageBreakTrigger*/)
        {
            $this->Cell($w, $h, '', $border, 0, '', $fill);
            $this->x-=$w;
        }
        $this->ClippingRect($this->x, $this->y, $w, $h);
        $this->Cell($w, $h, $txt, '', $ln, $align, 0, $link);
        $this->UnsetClipping();
    }

	function TextCL($x,$y,$w,$h, $txt, $center=FALSE)
	{
		$this->SetFontSize(8);
		$this->SetTextColor(0,0,64);
		$this->SetXY($x,$y);
		$this->Cell($w,$h,$txt,0,0,($center?"C":""));
	}

	function Box($x,$y,$w,$h, $txt="")
	{
		$this->SetFillColor(255);
		$this->SetDrawColor(0,0,32);
		$this->SetLineWidth(0.4);
		$this->Rect($x,$y,$w,$h,"FD");
		$this->SetXY($x+1,$y+1);
		$this->SetFontSize(12);
		$this->SetTextColor(0);
		/* new */ if ($txt) $this->SetFont("DejaVu");
		$this->ClippedCell($w-2,$h-2,$txt);
		/* new */ if ($txt) $this->SetFont("Arial");
	}

	function BoxesLine ($y, $dx,$dy)
	{
		if (!$txt) $txt = floor($y);
		$this->SetFont("arial","B",20);
		$this->SetTextColor(0,0,64);
		$this->Text($dx+8,$dy+58.5+$y*12, $txt);
		$this->Box($dx+15,$dy+51+$y*12,50,10);
		$this->Box($dx+67,$dy+51+$y*12,28,10);
	}

	function Timesheet($competitor_id,$competitor_name,$category,$round,$ntimes,$position)
	{
		$ts_width = 210/2;
		$ts_height = 297/2;
		if (!$this->row && !$this->column) $this->AddPage();
		$dx = $this->column ? $ts_width : 0;
		$dy = $this->row ? $ts_height : 0;
		$this->SetFont('Arial','B',12);
		//
		if (file_exists($this->fname))
			$this->Image($this->fname,$dx+5,$dy+5,$ts_width-10,$ts_height-10);
		else
		{
			$this->SetFillColor(255,255,255);
			$this->Rect($dx+5,$dy+5,$ts_width-10,$ts_height-10,"F");
			$this->SetFontSize(14);
			$this->SetTextColor(0,0,64);
			$this->SetXY($dx+5,$dy+5);
			$this->ClippedCell($ts_width-10,30,$_SESSION["c_name"],0,0,"C");
		}
		if ($position) $this->TextCL($dx+5,$dy+6,10,3, $position);
		$this->TextCL($dx+15,$dy+36-5.5,95-7-2-15,7,"category");
		$this->TextCL($dx+95-9,$dy+36-5.5,7,7,"round");
		$this->Box($dx+15,$dy+36,94-7-2-15,7,$category);
		$this->Box($dx+94-7,$dy+36,8,7,$round);
		$this->TextCL($dx+15,$dy+48-5.5,12,7,"id");
		$this->TextCL($dx+29,$dy+48-5.5,95-29,7,"name");
		$this->Box($dx+15,$dy+48,12,7,$competitor_id);
		//$this->Box($dx+29,$dy+48,95-29,7,UTF8transl($competitor_name));
		$this->Box($dx+29,$dy+48,95-29,7,$competitor_name);
		//
		$this->TextCL($dx+15,$dy+55,50,10,"results",true);
		$this->TextCL($dx+67,$dy+55,28,10,"judge",true);
		//
		for ($y=1;$y<=$ntimes;$y++) $this->BoxesLine ($y, $dx,$dy);
		$this->BoxesLine ($y+0.5, $dx,$dy);
		//
		$this->column = !$this->column;
		if (!$this->column) $this->row = !$this->row;
	}
}

$sebastien = 55; // Auroux
if (($_GET["cat_id"] && $_GET["round"]) || $_GET["comp_id"])
{
	if ($_GET["comp_id"])
		$result = strict_mysql_query("SELECT $regstable.comp_id AS compid, $regstable.cat_id AS catid, $regstable.round AS round, categories.name AS catname, $compstable.name AS compname FROM $regstable JOIN categories ON $regstable.cat_id=categories.id JOIN $compstable ON $regstable.comp_id=$compstable.id WHERE $regstable.comp_id=".$_GET["comp_id"]." AND $regstable.round=1 ORDER BY categories.id");
	else
	{
		$query = "SELECT $regstable.comp_id AS compid, categories.name AS catname, $compstable.name AS compname FROM $regstable JOIN categories ON $regstable.cat_id=categories.id JOIN $compstable ON $regstable.comp_id=$compstable.id";
		if ($_GET["round"]>1)
			$query .= " JOIN $timestable ON $timestable.cat_id=$regstable.cat_id AND $timestable.round=". ($_GET["round"]-1). " AND $timestable.comp_id=$regstable.comp_id";
		$query .= " WHERE $regstable.cat_id=".$_GET["cat_id"]." AND $regstable.round=".$_GET["round"];
		if ($_GET["round"]>1)
			$query .= " ORDER BY $timestable.t1 IS NULL, $timestable.average=\"\", $timestable.average, $timestable.best, $compstable.name";
		elseif ($_SESSION["c_id"]==$sebastien)
			$query .= " ORDER BY compid";
		else
			$query .= " ORDER BY compname";
		$result = strict_mysql_query($query);
	}
	if (mysql_num_rows($result))
	{
		if (!$_GET["comp_id"])
		{
			$t = strict_mysql_query("SELECT times FROM $eventstable JOIN formats ON $eventstable.r" .$_GET["round"]. "_format=formats.id WHERE $eventstable.id=".$_GET["cat_id"]);
			$t = cased_mysql_result($t,0,"times");
		}
		//
		$ts = new TS();
		/* new */ $ts->AddFont('DejaVu','','DejaVuSans.ttf',true);
		$count = 0;
		while ($row=cased_mysql_fetch_array($result))
		{
			if ($_GET["comp_id"])
			{
				$t = strict_mysql_query("SELECT times FROM $eventstable JOIN formats ON $eventstable.r1_format=formats.id WHERE $eventstable.id=".$row["catid"]);
				$t = cased_mysql_result($t,0,"times");
			}
			// $ts->Timesheet($row["compid"], $row["compname"], $row["catname"], ($_GET["comp_id"]?$row["round"]:$_GET["round"]), $t);
			$compname = preg_replace("/\(.*\)/","",$row["compname"]);
			if (!$_GET["comp_id"]) $count++;
			$ts->Timesheet($row["compid"], $compname, $row["catname"], ($_GET["comp_id"]?$row["round"]:$_GET["round"]), $t, $count);
		}
		$ts->SetDisplayMode("fullpage","single");
		$ts->Output();
	}
	elseif ($_GET["comp_id"])
		die("This competitor is not registered to any event or these events are not yet open");
}
elseif ($_GET["aofr"])
{
	$ts = new TS();
	/* new */ $ts->AddFont('DejaVu','','DejaVuSans.ttf',true);
	$ofr = strict_mysql_query("SELECT $eventstable.id, categories.name, times FROM $eventstable JOIN categories ON (categories.id=$eventstable.id) JOIN formats ON (formats.id=$eventstable.r1_format) WHERE r1_open=1 ORDER BY $eventstable.id");
	while ($rowe=cased_mysql_fetch_array($ofr))
	{
		$query = "SELECT id, name FROM $compstable WHERE cat".$rowe["id"]."=\"X\"";
		if ($_SESSION["c_id"]==$sebastien)
			$query .= " ORDER BY id";
		else
			$query .= " ORDER BY name";
		$comps = strict_mysql_query($query);
		$count = 0;
		while ($row=cased_mysql_fetch_array($comps))
		{
			$compname = preg_replace("/\(.*\)/","",$row["name"]);
			$count++;
			$ts->Timesheet($row["id"], $compname, $rowe["name"], 1, $rowe["times"], $count);
		}
	}
	$ts->SetDisplayMode("fullpage","single");
	$ts->Output();
}
else
{
	$ts = new TS();
	for ($x=1;$x<=4;$x++)
		$ts->Timesheet("","","","",5,0);
	$ts->SetDisplayMode("fullpage","single");
	$ts->Output();
}
mysql_close();
?>
