<?
function _GET_key($key)
// do not use for variables that will be appended to queries!
{
	return (array_key_exists($key,$_GET) ? $_GET[$key] : null);
}

function _GET_num($key)
{
	$v = _GET_key($key);
	return (is_numeric($v) ? $v+0 : null);
}

function _GET_fld($key)
{
	$v = _GET_key($key);
	if ($v === null) return null;
	$v = $v."";
	return preg_replace("/[^a-zA-Z0-9_]/","",$v);
}

function _GET_name($key)
{
	$v = _GET_key($key);
	if ($v == null) return null;
	$v = $v."";
	$v = preg_replace('/[\\\"\;]/','',$v);
	return $v;
}

function _GET_birthday($key)
{
	$v = _GET_key($key);
	if ($v == null) return null;
	$v = $v."";
	return preg_replace('/[^0-9\-]/','',$v);
}

?>
