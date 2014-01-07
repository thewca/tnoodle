Database Structure
==================


TODO - document how to create a competition/create a page for it

    http://localhost:2014/h2

    MERGE INTO competitions (id, admin_pw, intro_pw, country, date_b, date_e, name, place, website) VALUES(0, 'pass', 'pass', 'AF', now(), now()+100, 'Foo comp', 'Place', 'foo.bar.com');


Apart from the databases created in INC_INITDB.PHP, several databases must exist for the system to work:

<pre><code>
--
-- Table structure for table `competitions`
--

CREATE TABLE IF NOT EXISTS `competitions` (
  `id` int(6) NOT NULL auto_increment,
  `name` varchar(50) NOT NULL,
  `place` varchar(50) NOT NULL,
  `date_b` date NOT NULL,
  `date_e` date NOT NULL,
  `website` varchar(100) NOT NULL,
  `country` varchar(2) NOT NULL,
  `admin_pw` varchar(20) NOT NULL,
  `intro_pw` varchar(20) NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `date_b` (`date_b`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



--
-- Table structure for table `categories`
--

CREATE TABLE IF NOT EXISTS `categories` (
  `id` tinyint(2) NOT NULL auto_increment,
  `name` varchar(40) NOT NULL,
  `possible_formats` varchar(5) NOT NULL,
  `abbr` varchar(6) NOT NULL,
  `cusa_abbr` varchar(6) NOT NULL,
  `timetype` tinyint(1) NOT NULL default '1',
  `inseconds` tinyint(1) NOT NULL,
  `canhavetimelimit` tinyint(1) NOT NULL default '1',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=20 DEFAULT CHARSET=utf8 AUTO_INCREMENT=20 ;

--
-- Dumping data for table `categories`
--

MERGE INTO `categories` VALUES (1, 'Rubik''s Cube', '1345', '333', '3x3', 1, 1, 1);
MERGE INTO `categories` VALUES (2, '2x2x2 Cube', '1345', '222', '2x2', 1, 1, 1);
MERGE INTO `categories` VALUES (3, '4x4x4 Cube', '1345', '444', '4x4', 1, 0, 1);
MERGE INTO `categories` VALUES (4, '5x5x5 Cube', '1345', '555', '5x5', 1, 0, 1);
MERGE INTO `categories` VALUES (5, '6x6x6 Cube', '2345', '666', '6x6', 1, 0, 1);
MERGE INTO `categories` VALUES (6, '7x7x7 Cube', '2345', '777', '7x7', 1, 0, 1);
MERGE INTO `categories` VALUES (7, 'Clock', '1345', 'clock', 'clock', 1, 1, 1);
MERGE INTO `categories` VALUES (8, 'Magic', '1345', 'magic', 'magic', 1, 1, 1);
MERGE INTO `categories` VALUES (9, 'Master Magic', '1345', 'mmagic', 'mmagic', 1, 1, 1);
MERGE INTO `categories` VALUES (10, 'Megaminx', '1345', 'minx', 'mega', 1, 0, 1);
MERGE INTO `categories` VALUES (11, 'Pyraminx', '1345', 'pyram', 'pyra', 1, 1, 1);
MERGE INTO `categories` VALUES (12, 'Square-1', '1345', 'sq1', 'sq1', 1, 1, 1);
MERGE INTO `categories` VALUES (13, 'Rubik''s Cube: One-handed', '1345', '333oh', '333oh', 1, 1, 1);
MERGE INTO `categories` VALUES (14, 'Rubik''s Cube: With Feet', '3452', '333ft', '333ft', 1, 0, 1);
MERGE INTO `categories` VALUES (15, 'Rubik''s Cube: Fewest moves', '345', '333fm', 'fmc', 2, 0, 0);
MERGE INTO `categories` VALUES (16, 'Rubik''s Cube: Blindfolded', '345', '333bf', '333bld', 1, 0, 1);
MERGE INTO `categories` VALUES (17, '4x4x4 Cube: Blindfolded', '345', '444bf', '444bld', 1, 0, 1);
MERGE INTO `categories` VALUES (18, '5x5x5 Cube: Blindfolded', '345', '555bf', '555bld', 1, 0, 1);
MERGE INTO `categories` VALUES (19, 'Rubik''s Cube: Multiple Blindfolded', '345', '333mbf', '333mlt', 3, 1, 0);



--
-- Table structure for table `countries`
--

CREATE TABLE IF NOT EXISTS `countries` (
  `id` varchar(2) NOT NULL default '',
  `name` varchar(50) NOT NULL default '',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `countries`
--

MERGE INTO `countries` VALUES ('AF', 'Afghanistan');
MERGE INTO `countries` VALUES ('AX', '�land Islands');
MERGE INTO `countries` VALUES ('AL', 'Albania');
MERGE INTO `countries` VALUES ('DZ', 'Algeria');
MERGE INTO `countries` VALUES ('AS', 'American Samoa');
MERGE INTO `countries` VALUES ('AD', 'Andorra');
MERGE INTO `countries` VALUES ('AO', 'Angola');
MERGE INTO `countries` VALUES ('AI', 'Anguilla');
MERGE INTO `countries` VALUES ('AQ', 'Antarctica');
MERGE INTO `countries` VALUES ('AG', 'Antigua and Barbuda');
MERGE INTO `countries` VALUES ('AR', 'Argentina');
MERGE INTO `countries` VALUES ('AM', 'Armenia');
MERGE INTO `countries` VALUES ('AW', 'Aruba');
MERGE INTO `countries` VALUES ('AU', 'Australia');
MERGE INTO `countries` VALUES ('AT', 'Austria');
MERGE INTO `countries` VALUES ('AZ', 'Azerbaijan');
MERGE INTO `countries` VALUES ('BS', 'Bahamas');
MERGE INTO `countries` VALUES ('BH', 'Bahrain');
MERGE INTO `countries` VALUES ('BD', 'Bangladesh');
MERGE INTO `countries` VALUES ('BB', 'Barbados');
MERGE INTO `countries` VALUES ('BY', 'Belarus');
MERGE INTO `countries` VALUES ('BE', 'Belgium');
MERGE INTO `countries` VALUES ('BZ', 'Belize');
MERGE INTO `countries` VALUES ('BJ', 'Benin');
MERGE INTO `countries` VALUES ('BM', 'Bermuda');
MERGE INTO `countries` VALUES ('BT', 'Bhutan');
MERGE INTO `countries` VALUES ('BO', 'Bolivia');
MERGE INTO `countries` VALUES ('BA', 'Bosnia and Herzegovina');
MERGE INTO `countries` VALUES ('BW', 'Botswana');
MERGE INTO `countries` VALUES ('BV', 'Bouvet Island');
MERGE INTO `countries` VALUES ('BR', 'Brazil');
MERGE INTO `countries` VALUES ('IO', 'British Indian Ocean Territory');
MERGE INTO `countries` VALUES ('BN', 'Brunei Darussalam');
MERGE INTO `countries` VALUES ('BG', 'Bulgaria');
MERGE INTO `countries` VALUES ('BF', 'Burkina Faso');
MERGE INTO `countries` VALUES ('BI', 'Burundi');
MERGE INTO `countries` VALUES ('KH', 'Cambodia');
MERGE INTO `countries` VALUES ('CM', 'Cameroon');
MERGE INTO `countries` VALUES ('CA', 'Canada');
MERGE INTO `countries` VALUES ('CV', 'Cape Verde');
MERGE INTO `countries` VALUES ('KY', 'Cayman Islands');
MERGE INTO `countries` VALUES ('CF', 'Central African Republic');
MERGE INTO `countries` VALUES ('TD', 'Chad');
MERGE INTO `countries` VALUES ('CL', 'Chile');
MERGE INTO `countries` VALUES ('CN', 'China');
MERGE INTO `countries` VALUES ('CX', 'Christmas Island');
MERGE INTO `countries` VALUES ('CC', 'Cocos (Keeling) Islands');
MERGE INTO `countries` VALUES ('CO', 'Colombia');
MERGE INTO `countries` VALUES ('KM', 'Comoros');
MERGE INTO `countries` VALUES ('CG', 'Congo');
MERGE INTO `countries` VALUES ('CD', 'Congo, The Democratic Republic of the');
MERGE INTO `countries` VALUES ('CK', 'Cook Islands');
MERGE INTO `countries` VALUES ('CR', 'Costa Rica');
MERGE INTO `countries` VALUES ('CI', 'Cote d''Ivoire');
MERGE INTO `countries` VALUES ('HR', 'Croatia');
MERGE INTO `countries` VALUES ('CU', 'Cuba');
MERGE INTO `countries` VALUES ('CY', 'Cyprus');
MERGE INTO `countries` VALUES ('CZ', 'Czech Republic');
MERGE INTO `countries` VALUES ('DK', 'Denmark');
MERGE INTO `countries` VALUES ('DJ', 'Djibouti');
MERGE INTO `countries` VALUES ('DM', 'Dominica');
MERGE INTO `countries` VALUES ('DO', 'Dominican Republic');
MERGE INTO `countries` VALUES ('EC', 'Ecuador');
MERGE INTO `countries` VALUES ('EG', 'Egypt');
MERGE INTO `countries` VALUES ('SV', 'El Salvador');
MERGE INTO `countries` VALUES ('GQ', 'Equatorial Guinea');
MERGE INTO `countries` VALUES ('ER', 'Eritrea');
MERGE INTO `countries` VALUES ('EE', 'Estonia');
MERGE INTO `countries` VALUES ('ET', 'Ethiopia');
MERGE INTO `countries` VALUES ('FK', 'Falkland Islands (Malvinas)');
MERGE INTO `countries` VALUES ('FO', 'Faroe Islands');
MERGE INTO `countries` VALUES ('FJ', 'Fiji');
MERGE INTO `countries` VALUES ('FI', 'Finland');
MERGE INTO `countries` VALUES ('FR', 'France');
MERGE INTO `countries` VALUES ('GF', 'French Guiana');
MERGE INTO `countries` VALUES ('PF', 'French Polynesia');
MERGE INTO `countries` VALUES ('TF', 'French Southern Territories');
MERGE INTO `countries` VALUES ('GA', 'Gabon');
MERGE INTO `countries` VALUES ('GM', 'Gambia');
MERGE INTO `countries` VALUES ('GE', 'Georgia');
MERGE INTO `countries` VALUES ('DE', 'Germany');
MERGE INTO `countries` VALUES ('GH', 'Ghana');
MERGE INTO `countries` VALUES ('GI', 'Gibraltar');
MERGE INTO `countries` VALUES ('GR', 'Greece');
MERGE INTO `countries` VALUES ('GL', 'Greenland');
MERGE INTO `countries` VALUES ('GD', 'Grenada');
MERGE INTO `countries` VALUES ('GP', 'Guadeloupe');
MERGE INTO `countries` VALUES ('GU', 'Guam');
MERGE INTO `countries` VALUES ('GT', 'Guatemala');
MERGE INTO `countries` VALUES ('GG', 'Guernsey');
MERGE INTO `countries` VALUES ('GN', 'Guinea');
MERGE INTO `countries` VALUES ('GW', 'Guinea-Bissau');
MERGE INTO `countries` VALUES ('GY', 'Guyana');
MERGE INTO `countries` VALUES ('HT', 'Haiti');
MERGE INTO `countries` VALUES ('HM', 'Heard Island and McDonald Islands');
MERGE INTO `countries` VALUES ('VA', 'Holy See (Vatican City State)');
MERGE INTO `countries` VALUES ('HN', 'Honduras');
MERGE INTO `countries` VALUES ('HK', 'Hong Kong');
MERGE INTO `countries` VALUES ('HU', 'Hungary');
MERGE INTO `countries` VALUES ('IS', 'Iceland');
MERGE INTO `countries` VALUES ('IN', 'India');
MERGE INTO `countries` VALUES ('ID', 'Indonesia');
MERGE INTO `countries` VALUES ('IR', 'Iran');
MERGE INTO `countries` VALUES ('IQ', 'Iraq');
MERGE INTO `countries` VALUES ('IE', 'Ireland');
MERGE INTO `countries` VALUES ('IM', 'Isle of Man');
MERGE INTO `countries` VALUES ('IL', 'Israel');
MERGE INTO `countries` VALUES ('IT', 'Italy');
MERGE INTO `countries` VALUES ('JM', 'Jamaica');
MERGE INTO `countries` VALUES ('JP', 'Japan');
MERGE INTO `countries` VALUES ('JE', 'Jersey');
MERGE INTO `countries` VALUES ('JO', 'Jordan');
MERGE INTO `countries` VALUES ('KZ', 'Kazakhstan');
MERGE INTO `countries` VALUES ('KE', 'Kenya');
MERGE INTO `countries` VALUES ('KI', 'Kiribati');
MERGE INTO `countries` VALUES ('KR', 'Korea');
MERGE INTO `countries` VALUES ('KW', 'Kuwait');
MERGE INTO `countries` VALUES ('KG', 'Kyrgyzstan');
MERGE INTO `countries` VALUES ('LA', 'Lao People''s Democratic Republic');
MERGE INTO `countries` VALUES ('LV', 'Latvia');
MERGE INTO `countries` VALUES ('LB', 'Lebanon');
MERGE INTO `countries` VALUES ('LS', 'Lesotho');
MERGE INTO `countries` VALUES ('LR', 'Liberia');
MERGE INTO `countries` VALUES ('LY', 'Libyan Arab Jamahiriya');
MERGE INTO `countries` VALUES ('LI', 'Liechtenstein');
MERGE INTO `countries` VALUES ('LT', 'Lithuania');
MERGE INTO `countries` VALUES ('LU', 'Luxembourg');
MERGE INTO `countries` VALUES ('MO', 'Macau');
MERGE INTO `countries` VALUES ('MK', 'Macedonia');
MERGE INTO `countries` VALUES ('MG', 'Madagascar');
MERGE INTO `countries` VALUES ('MW', 'Malawi');
MERGE INTO `countries` VALUES ('MY', 'Malaysia');
MERGE INTO `countries` VALUES ('MV', 'Maldives');
MERGE INTO `countries` VALUES ('ML', 'Mali');
MERGE INTO `countries` VALUES ('MT', 'Malta');
MERGE INTO `countries` VALUES ('MH', 'Marshall Islands');
MERGE INTO `countries` VALUES ('MQ', 'Martinique');
MERGE INTO `countries` VALUES ('MR', 'Mauritania');
MERGE INTO `countries` VALUES ('MU', 'Mauritius');
MERGE INTO `countries` VALUES ('YT', 'Mayotte');
MERGE INTO `countries` VALUES ('MX', 'Mexico');
MERGE INTO `countries` VALUES ('FM', 'Micronesia, Federated States of');
MERGE INTO `countries` VALUES ('MD', 'Moldova');
MERGE INTO `countries` VALUES ('MC', 'Monaco');
MERGE INTO `countries` VALUES ('MN', 'Mongolia');
MERGE INTO `countries` VALUES ('ME', 'Montenegro');
MERGE INTO `countries` VALUES ('MS', 'Montserrat');
MERGE INTO `countries` VALUES ('MA', 'Morocco');
MERGE INTO `countries` VALUES ('MZ', 'Mozambique');
MERGE INTO `countries` VALUES ('MM', 'Myanmar');
MERGE INTO `countries` VALUES ('NA', 'Namibia');
MERGE INTO `countries` VALUES ('NR', 'Nauru');
MERGE INTO `countries` VALUES ('NP', 'Nepal');
MERGE INTO `countries` VALUES ('NL', 'Netherlands');
MERGE INTO `countries` VALUES ('AN', 'Netherlands Antilles');
MERGE INTO `countries` VALUES ('NC', 'New Caledonia');
MERGE INTO `countries` VALUES ('NZ', 'New Zealand');
MERGE INTO `countries` VALUES ('NI', 'Nicaragua');
MERGE INTO `countries` VALUES ('NE', 'Niger');
MERGE INTO `countries` VALUES ('NG', 'Nigeria');
MERGE INTO `countries` VALUES ('NU', 'Niue');
MERGE INTO `countries` VALUES ('NF', 'Norfolk Island');
MERGE INTO `countries` VALUES ('MP', 'Northern Mariana Islands');
MERGE INTO `countries` VALUES ('NO', 'Norway');
MERGE INTO `countries` VALUES ('OM', 'Oman');
MERGE INTO `countries` VALUES ('PK', 'Pakistan');
MERGE INTO `countries` VALUES ('PW', 'Palau');
MERGE INTO `countries` VALUES ('PS', 'Palestinian Territory, Occupied');
MERGE INTO `countries` VALUES ('PA', 'Panama');
MERGE INTO `countries` VALUES ('PG', 'Papua New Guinea');
MERGE INTO `countries` VALUES ('PY', 'Paraguay');
MERGE INTO `countries` VALUES ('PE', 'Peru');
MERGE INTO `countries` VALUES ('PH', 'Philippines');
MERGE INTO `countries` VALUES ('PN', 'Pitcairn');
MERGE INTO `countries` VALUES ('PL', 'Poland');
MERGE INTO `countries` VALUES ('PT', 'Portugal');
MERGE INTO `countries` VALUES ('PR', 'Puerto Rico');
MERGE INTO `countries` VALUES ('QA', 'Qatar');
MERGE INTO `countries` VALUES ('RE', 'Reunion');
MERGE INTO `countries` VALUES ('RO', 'Romania');
MERGE INTO `countries` VALUES ('RU', 'Russia');
MERGE INTO `countries` VALUES ('RW', 'Rwanda');
MERGE INTO `countries` VALUES ('BL', 'Saint Barth�lemy');
MERGE INTO `countries` VALUES ('SH', 'Saint Helena');
MERGE INTO `countries` VALUES ('KN', 'Saint Kitts and Nevis');
MERGE INTO `countries` VALUES ('LC', 'Saint Lucia');
MERGE INTO `countries` VALUES ('MF', 'Saint Martin');
MERGE INTO `countries` VALUES ('PM', 'Saint Pierre and Miquelon');
MERGE INTO `countries` VALUES ('VC', 'Saint Vincent and the Grenadines');
MERGE INTO `countries` VALUES ('WS', 'Samoa');
MERGE INTO `countries` VALUES ('SM', 'San Marino');
MERGE INTO `countries` VALUES ('ST', 'Sao Tome and Principe');
MERGE INTO `countries` VALUES ('SA', 'Saudi Arabia');
MERGE INTO `countries` VALUES ('SN', 'Senegal');
MERGE INTO `countries` VALUES ('RS', 'Serbia');
MERGE INTO `countries` VALUES ('SC', 'Seychelles');
MERGE INTO `countries` VALUES ('SL', 'Sierra Leone');
MERGE INTO `countries` VALUES ('SG', 'Singapore');
MERGE INTO `countries` VALUES ('SK', 'Slovakia');
MERGE INTO `countries` VALUES ('SI', 'Slovenia');
MERGE INTO `countries` VALUES ('SB', 'Solomon Islands');
MERGE INTO `countries` VALUES ('SO', 'Somalia');
MERGE INTO `countries` VALUES ('ZA', 'South Africa');
MERGE INTO `countries` VALUES ('GS', 'South Georgia and the South Sandwich Islands');
MERGE INTO `countries` VALUES ('ES', 'Spain');
MERGE INTO `countries` VALUES ('LK', 'Sri Lanka');
MERGE INTO `countries` VALUES ('SD', 'Sudan');
MERGE INTO `countries` VALUES ('SR', 'Suriname');
MERGE INTO `countries` VALUES ('SJ', 'Svalbard and Jan Mayen');
MERGE INTO `countries` VALUES ('SZ', 'Swaziland');
MERGE INTO `countries` VALUES ('SE', 'Sweden');
MERGE INTO `countries` VALUES ('CH', 'Switzerland');
MERGE INTO `countries` VALUES ('SY', 'Syrian Arab Republic');
MERGE INTO `countries` VALUES ('TW', 'Taiwan');
MERGE INTO `countries` VALUES ('TJ', 'Tajikistan');
MERGE INTO `countries` VALUES ('TZ', 'Tanzania, United Republic of');
MERGE INTO `countries` VALUES ('TH', 'Thailand');
MERGE INTO `countries` VALUES ('TL', 'Timor-Leste');
MERGE INTO `countries` VALUES ('TG', 'Togo');
MERGE INTO `countries` VALUES ('TK', 'Tokelau');
MERGE INTO `countries` VALUES ('TO', 'Tonga');
MERGE INTO `countries` VALUES ('TT', 'Trinidad and Tobago');
MERGE INTO `countries` VALUES ('TN', 'Tunisia');
MERGE INTO `countries` VALUES ('TR', 'Turkey');
MERGE INTO `countries` VALUES ('TM', 'Turkmenistan');
MERGE INTO `countries` VALUES ('TC', 'Turks and Caicos Islands');
MERGE INTO `countries` VALUES ('TV', 'Tuvalu');
MERGE INTO `countries` VALUES ('UG', 'Uganda');
MERGE INTO `countries` VALUES ('UA', 'Ukraine');
MERGE INTO `countries` VALUES ('AE', 'United Arab Emirates');
MERGE INTO `countries` VALUES ('GB', 'United Kingdom');
MERGE INTO `countries` VALUES ('US', 'USA');
MERGE INTO `countries` VALUES ('UM', 'United States Minor Outlying Islands');
MERGE INTO `countries` VALUES ('UY', 'Uruguay');
MERGE INTO `countries` VALUES ('UZ', 'Uzbekistan');
MERGE INTO `countries` VALUES ('VU', 'Vanuatu');
MERGE INTO `countries` VALUES ('VE', 'Venezuela');
MERGE INTO `countries` VALUES ('VN', 'Vietnam');
MERGE INTO `countries` VALUES ('VG', 'Virgin Islands, British');
MERGE INTO `countries` VALUES ('VI', 'Virgin Islands, U.S.');
MERGE INTO `countries` VALUES ('WF', 'Wallis And Futuna');
MERGE INTO `countries` VALUES ('EH', 'Western Sahara');
MERGE INTO `countries` VALUES ('YE', 'Yemen');
MERGE INTO `countries` VALUES ('ZM', 'Zambia');
MERGE INTO `countries` VALUES ('ZW', 'Zimbabwe');



--
-- Table structure for table `formats`
--

CREATE TABLE IF NOT EXISTS `formats` (
  `id` tinyint(1) NOT NULL auto_increment,
  `name` varchar(12) NOT NULL,
  `times` tinyint(1) NOT NULL,
  `avgtype` tinyint(1) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 AUTO_INCREMENT=6 ;

--
-- Dumping data for table `formats`
--

MERGE INTO `formats` VALUES (1, 'average of 5', 5, 0);
MERGE INTO `formats` VALUES (2, 'mean of 3', 3, 1);
MERGE INTO `formats` VALUES (3, 'best of 3', 3, 2);
MERGE INTO `formats` VALUES (4, 'best of 2', 2, 2);
MERGE INTO `formats` VALUES (5, 'best of 1', 1, 2);

</code></pre>
