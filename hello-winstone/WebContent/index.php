<html>
<body>
<?php
 
	function print_rs($recordset) {
		while ($row = $recordset->fetch_assoc())
			print_r($row);
	}
 $db = mysql_connect('192.168.1.40');
 $result = mysql_query('SELECT NOW();');

 echo $db;
 echo "<br>";
 echo $result;
 echo "<br>";
 print_rs($result);
 echo "<br>";
 echo date("Y-m-d H:i:s");
 echo "<br>";
 echo "<br>";
 
 echo "Try a <a href='/HelloWorld'>servlet</a>!";
 
?>
</body>
</html>
