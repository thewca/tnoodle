<?php
error_reporting(E_ALL);

/*

Unfortunately, MySQL and h2 behave differently with the casing of table names
and column names. MySQL preserves the case of both table names and columns, whereas
h2 capitalizes all column names, and lowercases all table names.
These wrapper methods abtract away this difference.

See https://groups.google.com/forum/?fromgroups=#!topic/h2-database/YB25Esue7Rw for details.

*/

function cased_mysql_fetch_array($result) {
	$row = mysql_fetch_array($result);
	if(SQL_DBTYPE == "MySQL") {
		return $row;
	}
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

function cased_mysql_result($result, $row, $field) {
	if(SQL_DBTYPE != "MySQL") {
		$field = strtoupper($field);
	}
	return mysql_result($result, $row, $field);
}

function strict_mysql_query($query) {
	$result = mysql_query($query);
	if (!$result) {
		die('Invalid mysql_query query: ' . mysql_error());
	}
	return $result;
}

function refererMatchesHost()
{
    $referer    = $_SERVER['HTTP_REFERER'];
    $host       = $_SERVER['HTTP_HOST'];

    if (preg_match("/^$host/", $referer)) {
        return true;
    }

    return false;
}

?>
