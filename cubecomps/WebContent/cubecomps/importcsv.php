<?
require_once "lib.php";
session_start();

$color = "#6b7b71";
$light_color = "#b0c7b4";
$dark_color = "#0a1414";

?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<HTML>
<HEAD>
<TITLE>Importatition report</TITLE>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<META NAME="Author" CONTENT="">
<META NAME="Keywords" CONTENT="">
<META NAME="Description" CONTENT="">
<style type="text/css">
        body {font-family:verdana,sans-serif;font-size:11px;margin:10px 10px;background-color:<?=$color?>;color:#FFFFCC;}
        .header {background-color:<?=$dark_color?>;font-size:12px;padding:4px 6px;margin-bottom:4px;}
        .errors {margin-left:14px;}
</style>
</HEAD>
<BODY>
<?
require_once "lib_eve.php";
require_once "lib_com.php";
require_once "lib_reg.php";

function error ($msg)
{
        die("<div style='background-color:#8b1717;text-align:center;'><br><h2>" .$msg. "</h2><br><input type=button value=close onclick='window.close();'><br><br></div>");
}

function csvstring_to_array(&$string, $CSV_SEPARATOR = ',', $CSV_ENCLOSURE = '"', $CSV_LINEBREAK = "\n") {
  $o = array();

  $cnt = strlen($string);
  $esc = false;
  $escesc = false;
  $num = 0;
  $o[$num] = "";
  $i = 0;
  while ($i < $cnt) {
    $s = $string[$i];

    if ($s == $CSV_LINEBREAK) {
      if ($esc) {
        $o[$num] .= $s;
      } else {
        $i++;
        break;
      }
    } elseif ($s == $CSV_SEPARATOR) {
      if ($esc) {
        $o[$num] .= $s;
      } else {
        $num++;
                $o[$num] = "";
        $esc = false;
        $escesc = false;
      }
    } elseif ($s == $CSV_ENCLOSURE) {
      if ($escesc) {
        $o[$num] .= $CSV_ENCLOSURE;
        $escesc = false;
      }

      if ($esc) {
        $esc = false;
        $escesc = true;
      } else {
        $esc = true;
        $escesc = false;
      }
    } else {
      if ($escesc) {
        $o[$num] .= $CSV_ENCLOSURE;
        $escesc = false;
      }

      $o[$num] .= $s;
    }

    $i++;
  }

//  $string = substr($string, $i);

  return $o;
} 

require_once "lib_ref_admin.php";

if ($_FILES["file"]["error"] > 0)
        error("no filename selected to upload");

if ($_FILES["file"]["type"] != "text/csv" &&
        $_FILES["file"]["type"] != "text/comma-separated-values" &&
        $_FILES["file"]["type"] != "application/vnd.ms-excel" && 
        $_FILES["file"]["type"] != "application/octet-stream" &&
        $_FILES["file"]["type"] != "application/x-msexcel")
        error("not a CSV or XLS file (".$_FILES["file"]["type"].")");

if (($h = fopen($_FILES["file"]["tmp_name"], "r"))===FALSE) 
        error("could not open uploaded file");
$line = fgets($h);
$headers = array(
        "name"                  => 0,
        "country"               => 0,
        "wca id"                => 0,
        "birth date"    => 0,
        "gender"                => 0
);
$isCSV = true;
foreach ($headers as $key => $value)
        if (stripos($line,$key) === false) $isCSV = false;

//
require_once "db.php";
//
IF (!$isCSV)
{
        fclose($h);
        if (substr($_SERVER["REQUEST_URI"],0,6)=="/beta/")
                require_once "../".DIR_PHPEXCEL;
        else
                require_once DIR_PHPEXCEL;
        //
        $categories = strict_query("SELECT id, cusa_abbr FROM categories");
        $cats = array();
        while ($rcat=cased_mysql_fetch_array($categories))
                $cats[$rcat["cusa_abbr"]] = $rcat["id"];
        //
        $objReader = PHPExcel_IOFactory::createReader('Excel5');  
        $objReader->setReadDataOnly(true);  
        $xls = $objReader->load($_FILES["file"]["tmp_name"]);
        $sheet = $xls->setActiveSheetIndex(0);
        //
        $ncomp = 0;
        $nimp = 0;
        $errors = "";
        //
        $col = 9;
        while ($value = $sheet->getCellByColumnAndRow($col,3)->getValue())
        {
                if (isset($cats[$value]))
                {
                        $cats[$col] = $cats[$value];
                        addEve($cats[$value]);
                }
                $col++;
        }
        $top_col = $col - 1;
        //
        $row = 4;
        while ($name = $sheet->getCellByColumnAndRow(1,$row)->getValue())
        {
                $ncomp++;
                //
                $country = strict_query("SELECT id FROM countries WHERE name=?", array(($sheet->getCellByColumnAndRow(2,$row)->getValue())));
                if (!sql_num_rows($country))
                        $errors .= "Country name \"".$line[$headers["country"]]."\" not found in database<br>";
                else
                {
                        $birthday = PHPExcel_Style_NumberFormat::toFormattedString (floor($sheet->getCellByColumnAndRow(5,$row)->getValue()), "YYYY-MM-DD");
                        //
                        $err = addCom(
                                $sheet->getCellByColumnAndRow(3,$row)->getValue(), 
                                $name, 
                                $birthday, 
                                cased_mysql_result($country,0,"id"), 
                                $sheet->getCellByColumnAndRow(4,$row)->getValue(), 
                                true);
                        if (is_int($err))
                        {
                                $nimp++;
                                //
                                for ($col=9;$col<=$top_col;$col++)
                                        if (isset($cats[$col]) && $sheet->getCellByColumnAndRow($col,$row)->getValue().""=="1")
                                                toggleReg($err,$cats[$col]);            
                        }
                        else
                                $errors .= $err."<br>";
                }
                $row++;
        }
}
ELSE // ---------------------------------------------------------------------------------------------------------------------
{
        fseek($h,0);
        //
        $categories = strict_query("SELECT id, abbr FROM categories");
        $cats = array();
        while ($rcat=cased_mysql_fetch_array($categories))
                $cats[$rcat["abbr"]] = $rcat["id"];
        //
        $ncomp = 0;
        $nimp = 0;
        $errors = "";
        $headersdone = FALSE;
        while (($line = fgets($h))!==FALSE)
        {
                $line = csvstring_to_array(trim($line));
                if (!$headersdone)
                {
                        $col = 0;
                        foreach ($line as $value)
                        {
                                $value = strtolower($value);
                                if (isset($headers[$value])) 
                                        $headers[$value] = $col;
                                elseif (isset($cats[$value]))
                                {
                                        $cats[$col] = $cats[$value];
                                        addEve($cats[$value]);
                                }
                                        
                                $col++;
                        }
                }
                else
                {
                        $ncomp++;
                        //
                        $country = strict_query("SELECT id FROM countries WHERE name=?", array($line[$headers["country"]]));
                        if (!sql_num_rows($country))
                                $errors .= "Country name \"".$line[$headers["country"]]."\" not found in database<br>";
                        else
                        {
                                $birthday = $line[$headers["birth date"]];
                                $l = strlen($birthday);
                                if ($l < 10 && $l > 7)
                                {
                                        if (strpos($birthday,'-',5)==6) $birthday = substr_replace($birthday,"0",5,0);
                                        if (strlen($birthday)<10) $birthday = substr_replace($birthday,"0",8,0);
                                }
                                //
                                $err = addCom(
                                        $line[$headers["wca id"]], 
                                        $line[$headers["name"]], 
                                        $birthday, 
                                        cased_mysql_result($country,0,"id"), 
                                        $line[$headers["gender"]], 
                                        true);
                                if (is_int($err))
                                {
                                        $nimp++;
                                        //
                                        foreach($line as $x => $value)
                                                if (isset($cats[$x]) && $value=="1")
                                                        toggleReg($err,$cats[$x]);              
                                }
                                else
                                        $errors .= $err."<br>";
                        }
                }
                $headersdone = true;
        }
        fclose($h);
}
//
echo "<html><body onload='opener.location.reload();'>";
echo "<div class=header><b>Importation report</b></div>";
echo "<div class=errors>".($errors?$errors:"no errors!")."</div><p>";
echo "<div class=header>";
echo "<b>$nimp</b> competitors imported<br>";
if ($errors) echo "<b>".($ncomp-$nimp)."</b> lines ignored<br><p>";
echo "<center><input type=button value=close onclick='window.close();'></center><br></div>";
echo "</body></html>";
//
sql_close();

?> 
</BODY>
</HTML>
