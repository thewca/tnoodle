<?
// It's supposed that "live.".DOMAIN is the live domain
// and "test.".DOMAIN is the test domain
define("DOMAIN","cubecomps.com");

// See lib.php for details.
define("DBTYPE_MYSQL",1); // uses MySQL legacy functions
define("DBTYPE_H2",2);    // uses PDO MySQL with h2/quercus
define("SQL_DBTYPE",DBTYPE_H2);

// None of these need to be set for tnoodle, as it has configured quercus
// to ignore the paramters in calls to mysql_connect, and use h2.
define("SQL_SERVER",___);

define("SQL_USER","root");
define("SQL_PASSWORD","password");
define("SQL_DSN","java:comp/env/jdbc/connPool");

define("SQL_TEST_USER",___);
define("SQL_TEST_PASSWORD",___);
define("SQL_TEST_DSN",___);

/*
 * Use of a beta system is enabled.  I just use a folder called '/beta' to place all the code there.
 *
 * substr($_SERVER["REQUEST_URI"],0,6)=="/beta/" detects beta.
 *
 * In that case, you'll need to reference some dirs differently depending on whether you're using the beta or not.  
 * To make it simple, the beta just adds "../" before the path.
 *
 * Make these paths relative or fix the lines where the beta use them.
 */

define("DIR_FPDF",___); // "../lib/tfpdf/tfpdf.php"
define("DIR_PHPEXCEL",___); // "../lib/PHPExcel/PHPExcel.php"

/* These are different;  both, relative and absolute references are needed.
 * This is the folder where the user uploads his/her scorecard backgroud image.
 * In addition, *.sch and *.gif files with the schedule and the banner for the public side are placed.
 */

define("DIR_UPLOADS",___); // "uploads/"
define("DIR_UPLOADS_ABS",___.DIR_UPLOADS); // "/homepages/...<>.../".DIR_UPLOADS

?>
