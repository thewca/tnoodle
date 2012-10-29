<?
function UTF8transl($st) 
{
	$transl = iconv("UTF-8", "ISO-8859-1//TRANSLIT//IGNORE", $st);
	if (strpos($transl,"?")!==FALSE) 
		$transl = $transl = iconv("UTF-8", "WINDOWS-1250//TRANSLIT//IGNORE", $st);
	return $transl;
}
?>