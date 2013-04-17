<?
function _POST_key($key)
{
        return (array_key_exists($key,$_POST) ? $_POST[$key] : null);
}

function _POST_num($key)
{
        $v = _POST_key($key);
        return (is_numeric($v) ? $v+0 : null);
}
?>
