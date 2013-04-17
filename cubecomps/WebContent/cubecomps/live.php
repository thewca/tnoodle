<?
require_once "lib.php";
require_once "inc_private.php";
require_once "lib_get.php";
// handhelds don't use to implement overflow:auto
require_once "lib_mob_det.php";
$detect = new Mobile_Detect();
$handheld = $detect->isMobile();
$detect = null;
$IE = (preg_match("/msie/i",$_SERVER["HTTP_USER_AGENT"]) || preg_match("/internet explorer/i",$_SERVER["HTTP_USER_AGENT"]));

$cat_id = NULL;

function earlyError($msg)
{
        exit("<html><body onload=\"setTimeout('window.location = \'http://".DOMAIN."\';',2500)\">$msg</body></html>");
}

function timelimitNum($t)
{
        if (!$t) return 0;
        $hh = (int)substr($t,7,2);
        $sec = (int)substr($t,4,2);
        $min = (int)substr($t,0,3);
        $hh = (($min*60)+$sec)*100+$hh;
        return $hh;
}

function formatTime($t,$type)
{
        if ($t=="") return "&nbsp;";
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
                return formatTime(substr($t,0,2),2)."/".formatTime(substr($t,2,2),2)."&nbsp;".formatTime(substr($t,4,9),1);
        }
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

function printEvent($event, &$coltimewidth, $print_headers=true,$_cat_id=NULL,$_round=NULL,$comp_id=NULL)
{
        global 
                $cid, $showmode,
                $regstable, $compstable, $timestable, $eventstable;
        //
        if ($event)
                global $cat_id, $round;
        else
        {
                $cat_id = $_cat_id;
                $round = $_round;
                $event = cased_mysql_fetch_array(strict_query("SELECT * FROM $eventstable WHERE id=?",array($cat_id)));
        }
        //
        $category = strict_query("SELECT * FROM categories WHERE id=?",array($cat_id));
        $timetype = cased_mysql_result($category,0,"timetype");
        if ($timetype==1)
                $coltimewidth = 60;
        elseif ($timetype==2)
                $coltimewidth = 30;
        else
                $coltimewidth = 100;
        //
        $format = strict_query("SELECT * FROM formats WHERE id=".$event["r".$round."_format"]);
        $times = cased_mysql_result($format,0,"times");
        $avgtype = cased_mysql_result($format,0,"avgtype");
        if (cased_mysql_result($category,0,"canhavetimelimit") && $round==1)
        {
                $timelimit = $event["timelimit"];
                if($timelimit) $timelimit = substr("000:00.00",0,9-strlen($timelimit)).$timelimit;
                if (!timelimitNum($timelimit)) $timelimit = "";
        }
        else
                $timelimit = "";
        //
        $nrounds = 4;
        while ($nrounds>1 && !$event["r$nrounds"]) $nrounds--;
        //
        // $cat_st = cased_mysql_result($category,0,"name")." - round ".$round;
        $cat_st = cased_mysql_result($category,0,"name")." - ".roundString($round,$nrounds,(cased_mysql_result($category,0,"canhavetimelimit") && $round==1 && $timelimit));
        if ($timelimit) $cat_st .= " - cutoff ".formatTime($timelimit,1);
        if (!$comp_id && !$showmode)
                echo "<div style='margin:0 0 6px 0;'>$cat_st</div>";

        // scores table - begin
        if ($print_headers)
        {
                if ($comp_id) echo "<br>";
                echo "<table class=TH cellspacing=0 border=0>";
                echo "<tr><th class=col_cl>#</th>";
                if (!$comp_id)
                        echo "<th style='width:200px;text-align:left;'>name</th><th style='width:101px;text-align:left;'>country</th>";
                else
                        echo "<th style='width:301px;text-align:left;'>event / round</th>";
                for ($x=1;$x<=$times;$x++)
                        echo "<th style='width:".($coltimewidth+1)."px;'>t$x</td>";
                switch($avgtype)
                {
                case 0:
                        echo "<th style='width:".($coltimewidth)."px;'>average</th>";
                        break;
                case 1:
                        echo "<th style='width:".($coltimewidth)."px;'>mean</th>";
                        break;
                }
                echo "<th style='width:".($coltimewidth)."px;'>best</th>";
                echo "</tr></table>";
                //
                echo "<table class=TD cellspacing=0 border=0>";
        }
        //
        $query =
                "SELECT $regstable.*, $compstable.name, $timestable.t1, $timestable.t2, $timestable.t3, $timestable.t4, $timestable.t5, $timestable.average, $timestable.best, countries.name AS cname FROM $regstable ".
                "LEFT OUTER JOIN $timestable ON ($regstable.cat_id=$timestable.cat_id AND $regstable.round=$timestable.round AND $regstable.comp_id=$timestable.comp_id) ".
                "JOIN $compstable ON ($regstable.comp_id=$compstable.id) ".
                "JOIN countries ON (countries.id=$compstable.country_id) ".
                "WHERE $regstable.cat_id=? AND $regstable.round=? ORDER BY $timestable.t1 IS NULL, $timestable.average='', $timestable.average, $timestable.best, $compstable.name";
        $list = strict_query($query,array($cat_id,$round));
        $qualified = (
                $round<4 && $event["r".($round+1)] ?
                $event["r".($round+1)."_groupsize"] :
                3
                );
        $classification = 0;
        $count = 0;
        $lasta = "";
        $lastb = "";
        while ($row=cased_mysql_fetch_array($list))
        {
                $count++;
                if (!$row["t1"])
                        $classification = "";
                elseif ($row["average"]!=$lasta || ($timetype!=3 && $row["best"]!=$lastb))
                {
                        $classification = $count;
                        $lasta = $row["average"];
                        $lastb = $row["best"];
                }
                if ($qualified > 0) // Elegible to proceed?
                {
                        if ($row["best"] > "A") $qualified = -1;
                }

                if (!$comp_id || $row["comp_id"]==$comp_id)
                {
                        echo ($comp_id || $count % 2)?"<tr class=row_even>":"<tr class=row_odd>";
                        echo "<td class=col_cl";
                        if ($classification && $classification<=$qualified) echo " style='background-color:#CCFF00;'";
                        echo "><b>$classification</b></td>";
                        if (!$comp_id)
                                echo "<td><div class=col_nm><a href='live.php?cid=$cid&compid=".$row["comp_id"]."'>" .$row["name"]. "</a></div></td><td><div class=col_ct>" .$row["cname"]. "</div></td>";
                        else
                                echo "<td><div class=col_ct style='width:300px'><a href='live.php?cid=$cid&cat=$cat_id&rnd=$round'>$cat_st</a></div></td>";
                        for ($x=1;$x<=$times;$x++)
                                if (!$comp_id)
                                        echo "<td class=col_tm>".formatTime($row["t$x"],$timetype)."</td>";
                                else
                                        echo "<td class=col_tm style='width:".$coltimewidth."px;'>".formatTime($row["t$x"],$timetype)."</td>";
                        if ($avgtype!=2) echo "<td style='width:".$coltimewidth."px;'><b>".formatTime($row["average"],$timetype)."</b></td>";
                        echo "<td style='width:".$coltimewidth."px;'>".($avgtype==2?"<b>":"") .formatTime($row["best"],$timetype). ($avgtype==2?"</b>":"")."</td>";
                        echo "</tr>";
                }
        }
        if (!$comp_id) echo "</table><br>";
        // score table -end
}

function printCompetitor($comp_id)
{
        global
                $compstable, $timestable;
        //
        $competitor = strict_query("SELECT $compstable.id, $compstable.name, $compstable.WCAid, $compstable.gender, countries.name AS cname FROM $compstable JOIN countries ON countries.id=$compstable.country_id WHERE $compstable.id=?",array($comp_id));
        if (!sql_num_rows($competitor))
        {
                echo "No such competitor in this competition!";
                return;
        }
        echo "<font size=+1>".cased_mysql_result($competitor,0,"name")."</font> &nbsp;&nbsp;·&nbsp;&nbsp; ".cased_mysql_result($competitor,0,"cname");
        $wcaid = cased_mysql_result($competitor,0,"WCAid");
        if ($wcaid) 
                echo " &nbsp;&nbsp;·&nbsp;&nbsp; see ".(cased_mysql_result($competitor,0,"gender")=="m"?"his":"her")." <a href='http://worldcubeassociation.org/results/p.php?i=".$wcaid."' target=_blank class=a_white>WCA's official results</a>";
        echo "<br>";
        //
        $scores = strict_query("SELECT * FROM $timestable WHERE comp_id=? ORDER BY cat_id, round",array($comp_id));
        if (!sql_num_rows($scores))
                echo "No scores available for this competitor yet.";
        else
        {
                $last_cat = 0;
                while ($row=cased_mysql_fetch_array($scores))
                {
                        if ($row["cat_id"]!=$last_cat)
                        {
                                if ($last_cat) echo "</table>";
                                $last_cat = $row["cat_id"];
                                $print_headers = true;
                        }
                        else
                                $print_headers = false;
                        //
                        printEvent(NULL,$dummy, $print_headers,$row["cat_id"],$row["round"],$comp_id);
                }
                echo "</table>";
        }
}

function fetch(&$l)
{
        $aux = $l;
        $p = strpos($aux,",");
        if ($p!==false)
        {
                $l = substr($aux,$p+1);
                return substr($aux,0,$p);
        }
        else
        {
                $l = "";
                return $aux;
        }
}

define("_RX",0);
define("_ID",1);
define("_RTOP",2);

require_once 'sch01.php';

function print_txt01_sch($fh,&$categories,&$events)
{
        global $IE, $timestable;
        //
        echo "\r\n<DIV id=SCH_container style='position:relative;height:95%;overflow-y:auto;font-weight:normal;'>\r\n";
        $timezone = trim(fgets($fh));
        $gmt = substr(trim(fgets($fh)),3);
        $timethere = time()+3600*(intval($gmt,10)-1 - 2); // A couple of hours delayed
        $pm = intval(trim(fgets($fh)),10);
        $line = trim(fgets($fh));
        $ox = 0;
        $position = 0;
        while ($line)
        {
                $day = strtotime($line);
                echo "<span style='position:absolute;top:".$ox."px;'><b>".date("l - F jS, Y",$day)."</b></span> <span style='position:absolute;top:".($ox+16)."px;width:300px;".($IE?"border-top:5px solid white;":"background-color:white;height:5px;")."'></span><p></p>\r\n";
                $ox += 36;
                $sch = new ScheduleClass($categories);
                $line = trim(fgets($fh));
                while ($line && !strtotime($line))
                {
                        $start = fetch($line);
                        $end = fetch($line);
                        $evt = fetch($line);
                        $altEvt = fetch($line);
                        $rnd = fetch($line);
                        $comment = fetch($line);
                        $sch->addRound($start,$end,$evt,$altEvt,$rnd,$comment);
                        //
                        $line = trim(fgets($fh));
                }
                //
                $openr = strict_query("SELECT DISTINCT CONCAT(abbr,'_',round) AS code FROM $timestable JOIN categories ON id=cat_id");
                $resultRnds = array();
                while ($rowor=cased_mysql_fetch_array($openr)) $resultRnds[$rowor["code"]] = true;
                //
                $a1 = getdate($timethere);
                $a2 = getdate($day);
                if ($a1["year"]==$a2["year"] && $a1["mon"]==$a2["mon"] && $a1["mday"]==$a2["mday"])
                {
                        $position = $a1["hours"]*12 + floor($a1["minutes"] / 5);
                        echo $sch->out($ox,$pm,$events,$resultRnds,$position);
                }
                else
                {
                        $dummy = null;
                        echo $sch->out($ox,$pm,$events,$resultRnds,$dummy);
                }
                $ox += 36;
                $sch = null;
        }
        echo "<span style='position:absolute;top:".$ox."px'><b>All times are $timezone (GMT$gmt)</b></span>\r\n";
        echo "</DIV>\r\n";
        fclose($fh);
        //
        if ($position) 
                echo "<script>window.onload=function() { document.getElementById('SCH_container').scrollTop=$position; };</script>\r\n";
}

function print_txt_sch($fn)
{
        global $competition, $eventstable;
        //
        $r = strict_query("SELECT name, abbr FROM categories");
        while ($row=cased_mysql_fetch_array($r))
                $categories[$row["abbr"]] = $row["name"]; 
        $r = strict_query("SELECT * FROM $eventstable JOIN categories ON $eventstable.id=categories.id");
        while ($row=cased_mysql_fetch_array($r))
        {
                $events[_RX][$row["abbr"]] = 0;
                $events[_ID][$row["abbr"]] = $row["id"];
                $x = 1;
                while ($x <= 4 && $row["r$x"."_open"]) $x++;
                $events[_RTOP][$row["abbr"]] = $x-1;
        }
        //
        $fh = fopen($fn,'r');
        $ver = trim(fgets($fh));
        if ($ver != "00")
        {
                print_txt01_sch($fh,$categories,$events);
                return;
        }
        //
        echo "<h2>".cased_mysql_result($competition,0,"name")." Schedule</h2><p>";
        $timezone = fgets($fh);
        $line = fgets($fh);
        while ($line)
        {
                echo date("l - F jS, Y",strtotime($line))."<p>";
                echo "<table border=0 cellpadding=0 cellspacing=0 class=SCH><tr><th height=17 width=50>Start</th><th width=200>Event</th><th width=100>Round</th><th width=80>Format</th></tr>";
                $line = fgets($fh);
                while ($line && !strtotime($line))
                {
                        $time = fetch($line);
                        $abbr = fetch($line);
                        echo "<tr".($categories[$abbr]?"":" class=rest").">";
                        echo "<td height=17 align=right>$time</td>";
                        if ($categories[$abbr])
                        {
                                echo "<td>".$categories[$abbr]."</td>";
                                echo "<td>";
                                if (isset($events[_RX][$abbr]))
                                {
                                        $events[_RX][$abbr] = $events[_RX][$abbr] + 1;
                                        if ($events[_RX][$abbr] <= $events[_RTOP][$abbr])
                                                echo "<a href='live.php?cid=" .$_GET["cid"]. "&cat=" .$events[_ID][$abbr]. "&rnd=" .$events[_RX][$abbr]. "'>" .fetch($line). "</a>";
                                        else
                                                echo fetch($line);
                                }
                                else
                                        echo fetch($line);
                                echo "</td>";
                                echo "<td>".fetch($line)."</td>";
                        }
                        else
                                echo "<td colspan=3 align=center>$abbr</td>";
                        echo "<tr>";
                        //
                        $line = fgets($fh);
                }
                echo "</table><p><br>";
        }
        fclose($fh);
        //
        echo "All times are $timezone";
}

//=========================================================================================================================

if (!array_key_exists("cid", $_GET))
{
        header("Location: http://".DOMAIN."\r\n");
}
else
{
        session_start();
        $test = preg_match("~^test\\.~i",$_SERVER["HTTP_HOST"]);
        $cid = _GET_num("cid");
        $comp_id = _GET_num("compid");
        $schedule = _GET_num("schedule");
        $_GETcat = _GET_num("cat");
        $_GETrnd = _GET_num("rnd");
        $_GETsm = _GET_num("sm");
        $showmode = ($_GETcat && $_GETrnd && !$comp_id ? $_GETsm : false);

        $html_sch = DIR_UPLOADS.($test?"test_":"")."sch_$cid.html";
        if (!file_exists($html_sch)) $html_sch = "";
        $txt_sch = DIR_UPLOADS.($test?"test_":"")."sch_$cid.txt";
        if (!file_exists($txt_sch))
        {
                $txt_sch = "";
                if (!$html_sch) $schedule = false;
        }
        elseif (!$_GETcat && !$comp_id && !$schedule)
                $schedule = true;

        if ($test)
        {
                $DBH = new PDO(SQL_TEST_DSN, SQL_TEST_USER, SQL_TEST_PASSWORD);
        } 
        else 
        {
                $DBH = new PDO(SQL_DSN, SQL_USER, SQL_PASSWORD);
        }
        $competition = strict_query(
                "SELECT competitions.*, countries.name AS cname FROM competitions JOIN countries ON competitions.country=countries.id WHERE competitions.id=?",
                array($cid));
        if (sql_num_rows($competition) != 1) earlyError ("That competition is not available any more.");
        //
        $eventstable = "events$cid";
        $compstable = "competitors$cid";
        $regstable = "registrations$cid";
        $timestable = "times$cid";
        //
        $color = "#2b355a";
        $light_color = "#4471CC";
        $dark_color = "#000022";
?>
<html>
<head>
<TITLE><?=cased_mysql_result($competition,0,"name")?></TITLE>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<style type="text/css">
        body {font-family:arial,sans-serif;background-color:<?=$color?>;color:white;margin:0;}
        a {color:black;text-decoration:none;font-weight:bold;}
        a:hover {color:red;}
        .a_white {color:white;}

        .event, .c_event, .event_top, .blank, .extra {width:286px;height:18px;background:url('img/shadow-v.gif') right repeat-y;font-size:15px;font-weight:bold;background-color:<?=$dark_color?>;color:white;padding:2px 0 2px 10px;}
        .event, .c_event {cursor:pointer;}
        .c_event {color:#888;}
        .event:hover, .c_event:hover {background-color:#12182E;}
        .extra {height:100%;font-size:12px;font-weight:normal;}
        .event_top {width:300px;background:url('img/shadow-c.gif') right no-repeat;background-color:<?=$dark_color?>;}

        .round, .c_round {width:260px;height:18px;font-size:13px;font-weight:bold;color:black;padding:0 0 0 30px;background-color:#FFFFCC;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .round {cursor:pointer;}
        .c_round {color:#888;}
        .round:hover, .c_round:hover {background-color:#f9d395;}

        .collapser, .collapser_c {width:280px;display:none;overflow:hidden;margin:0;padding:0;}
        .collapser_c {overflow-y:auto;overflow-x:hidden;}
        .top {height:100px;
<?
        $banner_name = DIR_UPLOADS.($test?"test_":"")."ban_$cid.gif";
        if (file_exists($banner_name))
                echo "background:url('$banner_name') top right no-repeat;";
?>
        background-color:<?=$dark_color?>;padding:0 10px;font-weight:bold;color:#CCFF00;}
        .top a {color:white}
        .main {height:100%;background:url('img/shadow-h.gif') top repeat-x;font-weight:bold;font-size:12px;}
</style>
</head>
<body>
<?
        if ($showmode)
        {
?>
<script>
var smTimer = setTimeout("refreshPage();",30000);
function refreshPage()
{
        window.location.reload();
        smTimer = setTimeout("refreshPage();",30000);
}
</script>
<?
        }
        else
        {
?>
<script>

var cllsNoR;
var cllId;
var timerCll;
var step;

function getHeight(obj)
{
        if (!obj.style.display)
                return 0;
        else
                return (obj.height ? obj.height : obj.offsetHeight);
}

function setHeight(obj,h)
{
        if (h)
        {
                obj.style.height = h+"px";
                if (!obj.style.display) obj.style.display = "block";
        }
        else
                obj.style.display = "";
}

function expandOneStep()
{
        var alldone = true;
        var x = 0;
        do {
                x++;
                var obj = document.getElementById("cll"+x);
                if (obj)
                {
                        var h = getHeight(obj);
                        if (x==cllId)
                        {
                                if (h < cllsNoR[x]*18)
                                {
                                        h = Math.min(cllsNoR[x]*18, h+step);
                                        alldone = false;
                                }
                        }
                        else
                        {
                                if (h > 0)
                                {
                                        h = Math.max(0, h-step);
                                        alldone = false;
                                }
                        }
                        setHeight(obj,h);
                }
        } while (obj);
        if (!alldone) 
        {
                setTimeout("expandOneStep();",50);
                if (step < <?=$handheld?32:8?>) step = step*2;
        }
}

function expand(id,immediate)
{
        if (immediate)
                setHeight(document.getElementById("cll"+id), cllsNoR[id]*18);
        else
        {
                step = 1;
                cllId = id;
                expandOneStep();
        }
}
</script>
<?
                $events = strict_query("SELECT * FROM $eventstable JOIN categories ON $eventstable.id=categories.id ORDER BY categories.id");
        } // if

        echo "<TABLE width=100% height=100% cellspacing=0 cellpadding=0><TR valign=top><TD colspan=2>";
        if ($showmode)
        {
                $cat_id = $_GETcat;
                $round = $_GETrnd;
                $sevent = cased_mysql_fetch_array(strict_query("SELECT * FROM $eventstable WHERE id=?",array($cat_id)));
                echo "<div class=top><br><table style='font:inherit;color:inherit;'><tr valign=top><td><a href='live.php?cid=$cid&cat=$cat_id&rnd=$round' title='exit show mode'>[x]</a></td><td>";
                $category = strict_query("SELECT * FROM categories WHERE id=?",array($cat_id));
                if (cased_mysql_result($category,0,"canhavetimelimit") && $round==1)
                {
                        $timelimit = $sevent["timelimit"];
                        if($timelimit) $timelimit = substr("000:00.00",0,9-strlen($timelimit)).$timelimit;
                        if (!timelimitNum($timelimit)) $timelimit = "";
                }
                else
                        $timelimit = "";
                //
                $nrounds = 4;
                while ($nrounds>1 && !$sevent["r$nrounds"]) $nrounds--;
                //
                echo cased_mysql_result($category,0,"name")."<br>";
                // echo "round $round<br>";
                echo roundString($round,$nrounds,(cased_mysql_result($category,0,"canhavetimelimit") && $round==1 && $timelimit))."<br>";               
                if ($timelimit) echo "cutoff ".formatTime($timelimit,1);

                echo "</td></tr></table></div></TD></TR><TR valign=top><TD colspan=2 width=100% height=100% align=center>";
        }
        else
        {
                echo "<div class=top><br>".cased_mysql_result($competition,0,"name")."<br>".iconv("ISO-8859-1", "UTF-8", cased_mysql_result($competition,0,"place"))."<br>".cased_mysql_result($competition,0,"cname")."</div>";
                echo "</TD></TR><TR valign=top><TD>";
                
                // evts table - begin
                echo "<table height=100% cellspacing=0 cellpadding=0>";
                echo "<tr><td><div class=event_top>&nbsp;</div></td></tr>";
                $count = 1;
                while ($event=cased_mysql_fetch_array($events))
                {
                        echo "<tr valign=top><td><div class=".($event["r1_open"]?"event":"c_event")." onclick='expand($count,false);'>".$event["name"]."</div><div id=cll$count class=collapser>";
                        //
                        $nrounds = 4;
                        while ($nrounds>1 && !$event["r$nrounds"]) $nrounds--;
                        //
                        $x=1;
                        //while ($x<=4 && $event["r$x"])
                        while ($x<=$nrounds)
                        {
                                //$roundName = "round $x";
                                $roundName = roundString($x,$nrounds,$event["timelimit"]);
                                if ($event["r".$x."_open"])
                                {
                                        echo "<div class=round onclick='window.location=\"live.php?cid=$cid&cat=".$event["id"]."&rnd=$x\"'>$roundName</div>";
                                        //
                                        if (!$comp_id && !$schedule)
                                                if (($_GETcat==$event["id"] && $_GETrnd==$x) || !$cat_id || (!$_GETcat && $cat_id==$event["id"]))
                                                {
                                                        $cat_id = $event["id"];
                                                        $round = $x;
                                                        $sevent = $event;
                                                        $cllId = $count;
                                                }
                                }
                                else
                                        echo "<div class=c_round>$roundName</div>";
                                $x++;
                        }
                        $cllsNoR[$count] = $x-1;
                        echo "</div></td></tr>";
                        $count++;
                }
                $competitors = strict_query("SELECT id, name FROM $compstable ORDER BY name");
                if (sql_num_rows($competitors))
                {
                        echo "<tr><td><div class=blank>&nbsp;</div></td></tr>";
                        echo "<tr valign=top><td><div class=event onclick='expand($count,false);'>Competitors</div><div id=cll$count class=collapser_c>";
                        $c = 0;
                        $compPos = NULL;
                        while ($row=cased_mysql_fetch_array($competitors))
                        {
                                echo "<div class=round onclick='window.location=\"live.php?cid=$cid&compid=".$row["id"]."\"'>".$row["name"]."</div>";
                                if ($row["id"]==$comp_id) $compPos = $c;
                                $c++;
                        }
                        echo "</div></td></tr>";
                        if ($handheld)
                                $cllsNoR[$count] = sql_num_rows($competitors);
                        else
                                $cllsNoR[$count] = min(10,sql_num_rows($competitors));
                        if ($comp_id) $cllId = $count;
                }
                //
                if ($html_sch || $txt_sch)
                {
                        echo "<tr><td><div class=blank>&nbsp;</div></td></tr>";
                        echo "<tr valign=top><td><div class=event onclick='window.location=\"live.php?cid=$cid&schedule=1\";'>Schedule</div>";
                }
                //
                echo "<tr><td><div class=blank>&nbsp;</div></td></tr>";
                echo "<tr><td><div class=blank>";
                if ($schedule)
                        echo "<a class=a_white href='live.php?cid=$cid&schedule=1'>[refresh]</a>";
                elseif ($comp_id)
                        echo "<a class=a_white href='live.php?cid=$cid&compid=$comp_id'>[refresh]</a>";
                elseif (isset($round) && isset($cat_id))
                {
                        echo "<a class=a_white href='live.php?cid=$cid&cat=$cat_id&rnd=$round'>[refresh]</a> ";
                        echo "<a class=a_white href='live.php?cid=$cid&cat=$cat_id&rnd=$round&sm=1' title='enter show mode (auto-refresh)'>[show]</a>";
                }
                echo "</div></td></tr>";
                //
                //echo "<tr height=100%><td style='height:100%;'><div class=extra><div style='position:absolute;bottom:5px;'>(C) by <a class=a_white href='http://www.binarema.es' target=_blank>Binarema</a> · all rights reserved</div></div></td></tr>";
                echo "<tr height=100%><td style='height:100%;'><div class=extra></div></td></tr>";
                echo "</table>";
                // evts table - end

                echo "</TD><TD width=100% height=100%>";
        }

        echo "<div class=main><br>";
        if (!$cat_id && !$comp_id && !$schedule)
                echo "No events open yet in this competition";
        else
        {
                if ($schedule)
                {
                        if ($html_sch)
                                echo file_get_contents($html_sch);
                        else
                                print_txt_sch($txt_sch);
?>
<style>
        table.SCH {color:black;font-size:12px;-moz-box-shadow: 6px 6px 5px <?=$dark_color?>;-webkit-box-shadow: 6px 6px 5px <?=$dark_color?>; box-shadow: 6px 6px 5px <?=$dark_color?>;background-color:white;}
        table.SCH th {color:#FFFFCC;background-color:<?=$light_color?>;}
        table.SCH td {padding:0 5px;}
        span.SCH {color:black;position:absolute;padding:0 5px;-moz-box-shadow: 4px 4px 3px <?=$dark_color?>;-webkit-box-shadow: 4px 4px 3px <?=$dark_color?>; box-shadow: 4px 4px 3px <?=$dark_color?>;}
        span.HR {background-color:red;width:30px;position:absolute;left:-5px;font-size:9px;color:white; -moz-box-shadow: 2px 2px 2px <?=$dark_color?>;-webkit-box-shadow: 2px 2px 2px <?=$dark_color?>; box-shadow: 2px 2px 2px <?=$dark_color?>;}
        .rest {background-color:#ccc;}
</style>
<?              
                }
                else
                {
                        $coltimewidth = 0;
                        if ($comp_id)
                                printCompetitor($comp_id);
                        else
                                printEvent($sevent,$coltimewidth);
?>
<style>
        table.TH, table.TD {color:black;font-size:12px;-moz-box-shadow: 6px 6px 5px <?=$dark_color?>;-webkit-box-shadow: 6px 6px 5px <?=$dark_color?>; box-shadow: 6px 6px 5px <?=$dark_color?>;}
        table.TH th {color:#FFFFCC;background-color:<?=$light_color?>;}
        .row_odd {background-color:#ddd;}
        .row_odd:hover {background-color:#bbf;}
        .row_even {background-color:#fff;}
        .row_even:hover {background-color:#bbf;}
        .col_cl {width:26px;text-align:right;}
        .col_nm {width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;}
        .col_ct {width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;border-width:0 1px 0 0;border-style:solid;border-color:black;}
        .col_tm {<?=($coltimewidth?"width:".$coltimewidth."px;":"")?>border-width:0 1px 0 0;border-style:solid;border-color:black;}
        table.TH {font-size:12px;color:black;border-width:5px 5px 0 5px;}
        table.TD {font-size:12px;color:black;border-width:0 5px 5px 5px;}
        table.TD td, table.TH th {padding:0 3px;text-align:right;}
</style>
<?              
                }
        }
        echo "</div>";
        echo "</TD></TR>";
        echo "</TABLE>";
        echo "<script>";
        if (isset($cllsNoR))
        {
                echo "cllsNoR = new Array(0";
                foreach ($cllsNoR as $val) echo ",$val";
                echo ");";
        }
        if (isset($cllId))
        {
                if ($cllId) echo "expand($cllId,true);";
                if (isset($compPos) && $compPos) echo "document.getElementById('cll$cllId').scrollTop = ".($compPos*18).";";
        }
        echo "</script>";
        //
        sql_close();
?>
</body>
</html>
<?
}
?>
