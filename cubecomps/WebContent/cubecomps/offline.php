<?
session_start();
require_once "lib_admin.php";

$color = "#6b7b71";
$light_color = "#b0c7b4";
$dark_color = "#0a1414";
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

<div class=header>INSTRUCTIONS</div>
This feature is intended <b>only for competitions not managed online</b>. It drops any piece of existing data previous to import your manually filled XLSX file. The file is imported 'as is'. It is assumed that it doesn't contain errors nor violates WCA's regulations.
<p><br>
<div class=header>1. Preparation</div>
If you count with a CSV or XLS registration file, import it to cubecomps.com (EVENTS page). This is the most convenient way to set up events and rounds and to register competitors. (Optionally, you can open all first rounds in order to have the registered competitors listed in every event. But depending on if you will use a media other than the XLSX file produced by cubecomps.com to enter the scores, this can be simply useless.)
<p>
Otherwise, if you don't have a registration file, add the events and rounds of your competition manually.
<p>
It is not mandatory to enter the competitors details in this step, as it is supposed the imported XLSX file will include all that information.
<p>
You won't need to repeat this step if you have to import the XLSX file several times.
<p><br>
<div class=header>2. Export a blank XLSX</div>
Go to MISC page and export the XLSX file. It will be blank (scores and other details missing).
<p>
You won't need to repeat this step if you have to import the XLSX file several times.
<p><br>
<div class=header>3. Work offline</div>
You can enter all the scores directly to the XLSX file produced by cubecomps.com.
<p>
Another good idea is using the blank XLSX file that you can download from the WCA's website, then copy and paste to our XLSX file.
<p>
In any case, in order to get a valid XLSX file, pay attention to the details that cubecomps.com will focus on when importing:
<center><img src=img/import-1.jpg border=0></center><p>
In the pictures, the zones highlighted blue should be preserved. For example, in the picture above, the importation process expects a first     sheet called 'Registration'. The zones highlighted green should be filled by you. Logically, if you enter an unknown country or an invalid WCA ID or date of birth, the system will show an error and it will stop. The rest of the sheet will be ignored, so don't waste your time. Specifically, the events in which competitors registered are extracted from real scores in the first round of every event, so entering that information here is irrelevant. 
<center><img src=img/import-2.jpg border=0></center><p>
Here again, the information highlighted blue must be preserved because it describes the event, the round, the format,... The green zone must be filled. Besides, the identificated competitor (name / country / wca id) must exist in the first sheet. The rest of the information (best, worst, average...) is ignored because it will be calculated by the system. 
<p><br>
<div class=header>4. Importation</div>
Finally, import your XLSX file. Due to the importance of the operation, you are asked to confirm with you administrative password.
<p>
<form action="importall.php" method="post" enctype="multipart/form-data">
<label for="file">file:</label>
<input type="file" name="file" id="file" /><p>
<label for="pw">password:</label>
<input type="password" name="pw" id="pw" /><p>
<input type="submit" value="submit"/>
<input type="button" value="cancel" onclick="window.close();" />
</form>
<p>
You can import in an incremental fashion. That is, fill some rounds and import them to cubecomps.com. Then add new rounds and repeat until all of them are uploaded. You can do this for showing semi-live results of your competition.
<p>
<center><input type="button" value="close" onclick="window.close();" /></center>

</BODY>
</HTML>