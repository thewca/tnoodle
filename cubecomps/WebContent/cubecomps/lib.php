<?php
error_reporting(E_ALL);

/*
This library encompasses all the database functions.  The system allows three
ways for accessing the data:
1. MySQL legacy functions
2. MySQL PDO
3. MySQL PDO with h2/quercus (for TNoodle compatibility)

H2 behaves differently with the casing of table names and column names. 
MySQL preserves the case of both table names and columns, whereas
h2 capitalizes all column names, and lowercases all table names.
These wrapper methods abtract away this difference.

See https://groups.google.com/forum/?fromgroups=#!topic/h2-database/YB25Esue7Rw for details.

*/

function cased_mysql_fetch_array(&$result) 
{
	if (SQL_DBTYPE == DBTYPE_MYSQL)
		return mysql_fetch_array($result);
	$row = current($result);
	next($result);
	if (SQL_DBTYPE == DBTYPE_PDO)
		return $row;
	$new_row = array();
	foreach ($row as $key => $value) { 
		$key = strtolower($key);
		if($key == 'wcaid') {
			$key = 'WCAid';
		}
		$new_row[$key] = $value;
	}
	return $new_row;
}

function cased_mysql_result(&$result, $row, $field) 
{
	if (SQL_DBTYPE == DBTYPE_MYSQL)
		return mysql_result($result, $row, $field);
	if (SQL_DBTYPE == DBTYPE_H2) 
		$field = strtoupper($field);
	return $result[$row][$field];
}

function strict_query($query, $array = null) 
{
	if (SQL_DBTYPE == DBTYPE_MYSQL)
	{
		for ($x=0;$x<count($array);$x++)
			if (is_int($array[$x]))
				$query = preg_replace("/\?/", $array[$x],$query, 1);
			else
				$query = preg_replace("/\?/", "'".mysql_real_escape_string($array[$x])."'", $query, 1);
		$result = mysql_query($query);
		if (!$result)
			die('Invalid mysql_query query: ' . mysql_error());
		return $result;
	}
	else
	{
		global $DBH;
		$sth = $DBH->prepare ($query);
		if (!$sth)
			die("Could not prepare statement<br>\n" .
				"errorCode: " . $DBH->errorCode () . "<br>\n" .
				"errorInfo: " . join (", ", $DBH->errorInfo ()));
		for ($x=0;$x<count($array);$x++)
			$sth->bindParam($x+1, $array[$x], (is_int($array[$x]) ? PDO::PARAM_INT : PDO::PARAM_STR));
		if (!$sth->execute ())
			die("Could not execute statement<br>\n" .
				"errorCode: " . $sth->errorCode () . "<br>\n" .
				"errorInfo: " . join (", ", $sth->errorInfo ()));
		return $sth->fetchAll();
	}
}

function sql_num_rows(&$result) 
{
	if (SQL_DBTYPE == DBTYPE_MYSQL)
		return mysql_num_rows($result);
	else
		return count($result);
}

function sql_close()
{
	global $DBH;
	if (SQL_DBTYPE == DBTYPE_MYSQL)
		mysql_close();
	else
		$DBH = null;	
}

function sql_insert_id()
{
	global $DBH;
	if (SQL_DBTYPE == DBTYPE_MYSQL)
		return mysql_insert_id();
	else
		return (int)($DBH->lastInsertId());
}

function sql_data_reset(&$result)
{
	global $DBH;
	if (SQL_DBTYPE == DBTYPE_MYSQL)
		mysql_data_seek($result,0);
	else
		reset($result);
}

function refererMatchesHost()
{
    $referer = $_SERVER['HTTP_REFERER'];
    $host = preg_quote($_SERVER['HTTP_HOST']);

    if (preg_match("/^(http://)?$host/", $referer)) {
        return true;
    }

    return false;
}

?>
