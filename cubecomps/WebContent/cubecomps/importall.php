<?
require_once "lib.php";
session_start();
require_once "lib_ref_admin.php";
require_once "db.php";

$color = "#6b7b71";
$light_color = "#b0c7b4";
$dark_color = "#0a1414";

$result = strict_query("SELECT admin_pw FROM competitions WHERE id=".$_SESSION["c_id"]);
if (!$result || sql_num_rows($result)!=1 || cased_mysql_result($result,0,"admin_pw")!=$_POST["pw"])
{
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<HTML>
<HEAD>
<TITLE>Erroneous password</TITLE>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<style type="text/css">
        body {font-family:verdana,sans-serif;font-size:11px;margin:10px 10px;background-color:<?=$color?>;color:#FFFFCC;}
        .header {background-color:<?=$dark_color?>;font-size:12px;padding:4px 6px;margin-bottom:4px;}
        .errors {margin-left:14px;}
</style>
</HEAD>
<BODY>
<div class=header><b>Erroneous password</b></div>
<input type="button" value="close" onclick="window.close();" />
<div>
</BODY>
</HTML>
<?
        die();
}

?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<HTML>
<HEAD>
<TITLE><?=$_SESSION["c_name"]?></TITLE>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<META NAME="Author" CONTENT="">
<META NAME="Keywords" CONTENT="">
<META NAME="Description" CONTENT="">
<style type="text/css">
        body {background-color:<?=$color?>;font-family:arial,sans-serif;font-size:12px;color:#2a3837;}
        a {color:black;font-weight:bold;text-decoration:none;}
        a:hover {color:#CCFF00;}
        .header {color:white;background-color:<?=$dark_color?>;font-size:14px;font-weight:bold;padding:4px 10px;margin-bottom:4px;}
</style>
</HEAD>
<BODY>
<?
function error ($msg)
{
        die("<span style='background-color:red;color:white;'><b>&nbsp;&nbsp;&nbsp;" .$msg. "&nbsp;&nbsp;&nbsp;</b></span><p><input type=button value=close onclick='window.close();'><script>opener.location.reload();</script>");
        //die("<div style='background-color:#8b1717;text-align:center;'><br><b>" .$msg. "</b><br><br><input type=button value=close onclick='window.close();'><br><br></div>");
}

function timeNum($t,$type=NULL)
{
        if (!$t) die("ERROR: blank result");
        if ($t=="DNF" || $t=="DNS") return -1;
        global $timetype;
        if ($type===NULL) $type = $timetype;
        switch($type)
        {
        case 1:
                if (strlen($t)!=9) die("ERROR: time is not 9-char long (\"$t\")");
                $hh = (int)substr($t,7,2);
                $sec = (int)substr($t,4,2);
                if ($sec>=60) die("ERROR: illegal number of seconds (\"$t\")");
                $min = (int)substr($t,0,3);
                $hh = (($min*60)+$sec)*100+$hh;
                if ($timetype==3 && $hh>(60*60)*100) die("ERROR: time can't be over 60 minutes (\"$t\")");
                if ($hh==0) die("ERROR: time can't be zero (\"$t\")");
                return $hh;
                break;
        case 2:
                if (strlen($t)!=2) die("ERROR: moves is not 2-char long (\"$t\")");
                $moves = (int)$t;
                if ($timetype!=3)
                {
                        if ($moves>80) die("ERROR: moves can't be over 80 (\"$t\")");
                        if (!$moves) die("ERROR: moves can't be zero (\"$t\")");
                }
                return $moves;
                break;
        default:
                $a = timeNum(substr($t,0,2),2);
                $b = timeNum(substr($t,2,2),2);
                $c = timeNum(substr($t,4,9),1);
                if ($c < 0) return -1;
                if (!$b || $a>$b) die("ERROR: Invalid combination of solved and not solved cubes (\"$t\")");
                if ($a<$b/2) return -1;
                return ($c + (99-($a-($b-$a)))*6000000);
        }
}

function numTime($n,$type=NULL)
{
        if ($n==-1)
                return "DNF";
        elseif ($n==-2)
                return "DNS";
        global $timetype;
        $n = round($n);
        if (!$type) $type = $timetype;
        switch($type)
        {
        case 1:
                $hh = $n % 100;
                $n = ($n-$hh)/100;
                $sec = $n % 60;
                $min = ($n-$sec)/60;
                return sprintf("%03d:%02d.%02d", $min,$sec,$hh);
                break;
        case 2:
                return sprintf("%02d", $n);
                break;
        default:
                die ("ERROR: not implemented yet");
        }
}

function getAverageAndBest(&$average,&$best)
{
        global 
                $times,$timetype,$avgtype,
                $scores, $scoresread;
        //
        $average = 0;
        $dnfs = 0;
        switch($timetype)
        {
        case 1:
                $b = timeNum("999:59.99") + 1;
                break;
        case 2:
                $b = timeNum("80") + 1;
                break;
        default:
                $b = timeNum("0102060:00.00") + 1;
        }
        $w = 0;
        for ($x=1;$x<=$scoresread;$x++)
        {
                $t = $timetype==3 ? timeNum($scores[$x]) : $scores[$x];
                if ($t<0)
                        $dnfs++;
                else
                {
                        if ($t<$b) 
                        {
                                $b = $t;
                                $bidx = $x;
                        }
                        if ($timetype!=3)
                        {
                                if ($t>$w) $w = $t;
                                $average += $t;
                        }
                }
        }
        $cutpassed = ($scoresread==$times);
        // set BEST
        if ($dnfs==$scoresread)
                $best = "DNF";
        else
                $best = $timetype==3 ? $scores[$bidx] : numTime($scores[$bidx]);
        // set AVERAGE
        switch($avgtype)
        {
        case 0: // average of 5
                if (!$cutpassed)
                        $average = "";
                elseif ($dnfs>1)
                        $average = "DNF";
                elseif ($dnfs==1)
                        $average = numTime(($average-$b)/($times-2));
                else
                        $average = numTime(($average-$b-$w)/($times-2));
                break;
        case 1: // mean of 3
                if (!$cutpassed)
                        $average = "";
                elseif ($dnfs)
                        $average = "DNF";
                else
                        $average = numTime($average/$times);
                break;
        default: // best
                if ($timetype!=3)
                        $average = "";
                //elseif ($dnfs==$times)
                elseif ($dnfs==$scoresread)
                        $average = "DNF";
                else
                        $average = sprintf("%015d",$b); // trick to show results ordered
        }
}


if (substr($_SERVER["REQUEST_URI"],0,6)=="/beta/")
        require_once "../".DIR_PHPEXCEL;
else
        require_once DIR_PHPEXCEL;
require_once "lib_ref_admin.php";
require_once "db.php";
require_once "lib_com.php";
require_once "lib_eve.php";


if ($_FILES["file"]["error"] > 0) error("No filename selected to upload.");

$filename = $_FILES["file"]["tmp_name"];
$filetype = PHPExcel_IOFactory::identify($filename);
if ($filetype!="Excel2007") error("Unexpected file type; must be XLSX (Excel2007).");

$objReader = PHPExcel_IOFactory::createReader($filetype);
$xlsx = $objReader->load($filename);
echo "XLSX file open correctly.<p>";

$xlsx->setActiveSheetIndex(0);
$sheet = $xlsx->getActiveSheet();
if ($sheet->getTitle()!="Registration") error("'Registration' sheet missing.");

strict_query("DROP TABLE $eventstable, $compstable, $regstable, $timestable");
require_once "inc_initdb.php"; 
echo "Database reset.<p>";

$qc = strict_query("SELECT * FROM countries");
$countries = array();
for ($i=0;$i<sql_num_rows($qc);$i++) 
        $countries[cased_mysql_result($qc,$i,"name")] = cased_mysql_result($qc,$i,"id");

echo "Processing <b>Registration</b> sheet...";
//echo "<table>";
$i = 4;
while ($sheet->getCell("B$i")->getValue())
{
        //echo "<tr>";
        $value = $sheet->getCell("B$i")->getValue();
        //echo "<td>$value</td>";
        $name = $value;

        $value = $sheet->getCell("C$i")->getValue();
        if (!isset($countries[$value])) error ("Unknown country ('$value') at cell C$i");
        //echo "<td>$value</td>";
        $countryid = $countries[$value];

        $value = $sheet->getCell("D$i")->getValue();    
        if ($value && !preg_match("/^\d{4}[A-Z]{4}\d{2}$/",$value)) error ("Invalid WCA id format ('$value') at cell D$i");
        //echo "<td>$value</td>";
        $wcaid = $value;

        $value = $sheet->getCell("E$i")->getValue();    
        if ($value!="m" && $value!="f") error ("Invalid gender ('$value') at cell E$i");
        //echo "<td>$value</td>";
        $gender = $value;

        $value = $sheet->getCell("F$i")->getValue();
        if (!$value) error ("Birth date can't be blank at cell F$i");
        if (!is_numeric($value)) 
        {
                $birthday = $value;
                if (!checkdate((int)substr($birthday,5,2),(int)substr($birthday,8,2),(int)substr($birthday,0,4)))
                        error ("Invalid birth date format ('$value') at cell F$i");
        }
        else
        {
                $date = PHPExcel_Shared_Date::ExcelToPHPObject($value);
                //echo "<td>".$date->format("Y-m-d")."</td>";
                $birthday = $date->format("Y-m-d");
        }

        $r = addCom($wcaid,$name,$birthday,$countryid,$gender,true);
        if (!is_numeric($r)) error ("Error inserting in database: $r");

        //echo "</tr>";
        $i++;
}
//echo "</table>";
echo " Done! <b>".($i-4)." competitors</b> imported.<p>";

$lastabbr = "";
$round = 0;
$tsn = $xlsx->getSheetCount();
for ($sn=1;$sn<$tsn;$sn++)
{
        $xlsx->setActiveSheetIndex($sn);
        $sheet = $xlsx->getActiveSheet();
        $title = $sheet->getTitle();
        $pos = strpos($title,"-");
        if ($pos===FALSE) error ("Invalid sheet title format ('$title').");
        $abbr = substr($title,0,$pos);
        if ($abbr!=$lastabbr)
        {
                $lastabbr = $abbr;
                $category = strict_query("SELECT * FROM categories WHERE abbr=?", array($abbr));
                if (sql_num_rows($category)!=1) error ("Sheet title doesn't match any event abbreviation ('$abbr')");
                $evtid = (int)cased_mysql_result($category,0,"id");
                $timetype = cased_mysql_result($category,0,"timetype");
                $inseconds = cased_mysql_result($category,0,"inseconds");
                $round = 1;
                addEve($evtid);
        }
        else
                $round++;
        echo "Processing <b>".cased_mysql_result($category,0,"name")." - round $round</b> sheet...";

        $fmtst = substr($sheet->getCell("A2")->getValue(), 8);
        $format = strict_query("SELECT * FROM formats WHERE name=?", array($fmtst));
        if (sql_num_rows($format)!=1) error ("Invalid format ('$fmtst') at cell A2");
        $formatid = cased_mysql_result($format,0,"id");
        $times = cased_mysql_result($format,0,"times");
        $avgtype = cased_mysql_result($format,0,"avgtype");

        $i = 5;
        while ($sheet->getCell("B$i")->getValue())
        {
                $name = $sheet->getCell("B$i")->getValue();
                $country = $sheet->getCell("C$i")->getValue();
                if (!isset($countries[$country])) error ("Unknown country ('$country') at cell C$i");
                $countryid = $countries[$country];
                $wcaid = $sheet->getCell("D$i")->getValue();
                $competitor = strict_query("SELECT id FROM $compstable WHERE name=? AND country_id=? AND WCAid=?", array($name,$countryid,$wcaid));
                if (sql_num_rows($competitor)!=1) error ("Unregistered competitor at line $i");
                $competitorid = cased_mysql_result($competitor,0,"id");

                if ($round==1) strict_query("UPDATE $compstable SET cat?='X' WHERE id=?", array($evtid,$competitorid));
                strict_query("INSERT INTO $regstable SET cat_id=?, round=?, comp_id=?", array($evtid,$round,$competitorid));

                if ($sheet->getCell("E$i")->getValue())
                {
                        $scores = array();
                        if ($timetype!=3)
                        {
                                $t = 1;
                                while ($t<=$times && $sheet->getCell(chr(68+$t).$i)->getValue())
                                {
                                        $value = $sheet->getCell(chr(68+$t).$i)->getValue();
                                        if ($value=="DNF")
                                                $value = -1;
                                        elseif ($value=="DNS")
                                                $value = -2;
                                        else
                                        {
                                                if (!is_numeric($value)) error ("Illegal score at cell ".chr(68+$t).$i);
                                                if ($timetype==1)
                                                {
                                                        if ($inseconds)
                                                                $value = $value * 100;
                                                        else
                                                                $value = $value * 1440 * 60 * 100;
                                                }
                                        }
                                        $scores[$t] = $value;
                                        $t++;
                                }
                                $scoresread = $t-1;
                        }
                        else
                        {
                                $t = 0;
                                while ($t<$times && $sheet->getCell(chr(69+($t*4)).$i)->getValue())
                                {
                                        $value = $sheet->getCell(chr(69+($t*4)).$i)->getValue();
                                        if ($value!="DNF" && $value!="DNS")
                                        {
                                                if (!is_numeric($value)) error ("Illegal number of cubes tried at cell ".chr(69+($t*4)).$i);
                                                $solved = $sheet->getCell(chr(69+($t*4)+1).$i)->getValue();
                                                if (!is_numeric($solved)) error ("Illegal number of cubes solved at cell ".chr(69+($t*4)+1).$i);
                                                $seconds = $sheet->getCell(chr(69+($t*4)+2).$i)->getValue();
                                                if (!is_numeric($seconds)) error ("Illegal number of seconds at cell ".chr(69+($t*4)+2).$i);
                                                if ($solved < $value/2) error ("Score at cells ".chr(69+($t*4)).$i.":".chr(69+($t*4)+2).$i." should be DNF");
                                                $value = sprintf("%02d%02d", $solved,$value) . numTime($seconds*100,1);
                                        }
                                        $scores[$t+1] = $value;
                                        $t++;
                                }
                                $scoresread = $t;
                        }
                        getAverageAndBest($average,$best);

                        $insertst = "INSERT INTO $timestable SET cat_id=?, round=?, comp_id=?";
                        $array = array($evtid,$round,$competitorid);
                        for ($t=1;$t<=$scoresread;$t++)
                        {
                                $insertst .= ", t$t=?";
                                if ($timetype!=3)
                                        $array[count($array)] = numTime($scores[$t]);
                                else
                                        $array[count($array)] = $scores[$t]; 
                        }
                        $insertst .= ", average=?, best=?";
                        $array[count($array)] = $average; 
                        $array[count($array)] = $best; 
                        strict_query($insertst, $array);
                }

                $i++;
        }

        $i = $i - 5;
        $open = $i ? 1 : 0;
        strict_query("UPDATE $eventstable SET r?=1, r?_format=?, r?_groupsize=?, r?_open=? WHERE id=?", array($round,$round,$formatid,$round,$i,$round,$open,$evtid));

        echo " Done! <b>$i scorecards</b> imported.<br>";
}
echo "<script>opener.location.reload();</script>";
echo "<p><input type=button value=close onclick='window.close();' />";

sql_close();
?>
</BODY>
</HTML>
