Database Structure
==================


TODO - document how to create a competition/create a page for it

    http://localhost:8080/database-console

    insert into competitions (admin_pw, country, date_b, date_e, intro_pw, name, place, website) values('pass', 'AF', now(), now()+100, 'pass', 'Foo comp', 'Place', 'foo.bar.com');


Apart from the databases created in INC_INITDB.PHP, several databases must exist for the system to work:

<pre><code>
-- 
-- Table structure for table `competitions`
-- 

CREATE TABLE `competitions` (
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

CREATE TABLE `categories` (
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

INSERT INTO `categories` VALUES (1, 'Rubik''s Cube', '1345', '333', '3x3', 1, 1, 1);
INSERT INTO `categories` VALUES (2, '2x2x2 Cube', '1345', '222', '2x2', 1, 1, 1);
INSERT INTO `categories` VALUES (3, '4x4x4 Cube', '1345', '444', '4x4', 1, 0, 1);
INSERT INTO `categories` VALUES (4, '5x5x5 Cube', '1345', '555', '5x5', 1, 0, 1);
INSERT INTO `categories` VALUES (5, '6x6x6 Cube', '2345', '666', '6x6', 1, 0, 1);
INSERT INTO `categories` VALUES (6, '7x7x7 Cube', '2345', '777', '7x7', 1, 0, 1);
INSERT INTO `categories` VALUES (7, 'Clock', '1345', 'clock', 'clock', 1, 1, 1);
INSERT INTO `categories` VALUES (8, 'Magic', '1345', 'magic', 'magic', 1, 1, 1);
INSERT INTO `categories` VALUES (9, 'Master Magic', '1345', 'mmagic', 'mmagic', 1, 1, 1);
INSERT INTO `categories` VALUES (10, 'Megaminx', '1345', 'minx', 'mega', 1, 0, 1);
INSERT INTO `categories` VALUES (11, 'Pyraminx', '1345', 'pyram', 'pyra', 1, 1, 1);
INSERT INTO `categories` VALUES (12, 'Square-1', '1345', 'sq1', 'sq1', 1, 1, 1);
INSERT INTO `categories` VALUES (13, 'Rubik''s Cube: One-handed', '1345', '333oh', '333oh', 1, 1, 1);
INSERT INTO `categories` VALUES (14, 'Rubik''s Cube: With Feet', '3452', '333ft', '333ft', 1, 0, 1);
INSERT INTO `categories` VALUES (15, 'Rubik''s Cube: Fewest moves', '345', '333fm', 'fmc', 2, 0, 0);
INSERT INTO `categories` VALUES (16, 'Rubik''s Cube: Blindfolded', '345', '333bf', '333bld', 1, 0, 1);
INSERT INTO `categories` VALUES (17, '4x4x4 Cube: Blindfolded', '345', '444bf', '444bld', 1, 0, 1);
INSERT INTO `categories` VALUES (18, '5x5x5 Cube: Blindfolded', '345', '555bf', '555bld', 1, 0, 1);
INSERT INTO `categories` VALUES (19, 'Rubik''s Cube: Multiple Blindfolded', '345', '333mbf', '333mlt', 3, 1, 0);



-- 
-- Table structure for table `countries`
-- 

CREATE TABLE `countries` (
  `id` varchar(2) NOT NULL default '',
  `name` varchar(50) NOT NULL default '',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `countries`
-- 

INSERT INTO `countries` VALUES ('AF', 'Afghanistan');
INSERT INTO `countries` VALUES ('AX', '�land Islands');
INSERT INTO `countries` VALUES ('AL', 'Albania');
INSERT INTO `countries` VALUES ('DZ', 'Algeria');
INSERT INTO `countries` VALUES ('AS', 'American Samoa');
INSERT INTO `countries` VALUES ('AD', 'Andorra');
INSERT INTO `countries` VALUES ('AO', 'Angola');
INSERT INTO `countries` VALUES ('AI', 'Anguilla');
INSERT INTO `countries` VALUES ('AQ', 'Antarctica');
INSERT INTO `countries` VALUES ('AG', 'Antigua and Barbuda');
INSERT INTO `countries` VALUES ('AR', 'Argentina');
INSERT INTO `countries` VALUES ('AM', 'Armenia');
INSERT INTO `countries` VALUES ('AW', 'Aruba');
INSERT INTO `countries` VALUES ('AU', 'Australia');
INSERT INTO `countries` VALUES ('AT', 'Austria');
INSERT INTO `countries` VALUES ('AZ', 'Azerbaijan');
INSERT INTO `countries` VALUES ('BS', 'Bahamas');
INSERT INTO `countries` VALUES ('BH', 'Bahrain');
INSERT INTO `countries` VALUES ('BD', 'Bangladesh');
INSERT INTO `countries` VALUES ('BB', 'Barbados');
INSERT INTO `countries` VALUES ('BY', 'Belarus');
INSERT INTO `countries` VALUES ('BE', 'Belgium');
INSERT INTO `countries` VALUES ('BZ', 'Belize');
INSERT INTO `countries` VALUES ('BJ', 'Benin');
INSERT INTO `countries` VALUES ('BM', 'Bermuda');
INSERT INTO `countries` VALUES ('BT', 'Bhutan');
INSERT INTO `countries` VALUES ('BO', 'Bolivia');
INSERT INTO `countries` VALUES ('BA', 'Bosnia and Herzegovina');
INSERT INTO `countries` VALUES ('BW', 'Botswana');
INSERT INTO `countries` VALUES ('BV', 'Bouvet Island');
INSERT INTO `countries` VALUES ('BR', 'Brazil');
INSERT INTO `countries` VALUES ('IO', 'British Indian Ocean Territory');
INSERT INTO `countries` VALUES ('BN', 'Brunei Darussalam');
INSERT INTO `countries` VALUES ('BG', 'Bulgaria');
INSERT INTO `countries` VALUES ('BF', 'Burkina Faso');
INSERT INTO `countries` VALUES ('BI', 'Burundi');
INSERT INTO `countries` VALUES ('KH', 'Cambodia');
INSERT INTO `countries` VALUES ('CM', 'Cameroon');
INSERT INTO `countries` VALUES ('CA', 'Canada');
INSERT INTO `countries` VALUES ('CV', 'Cape Verde');
INSERT INTO `countries` VALUES ('KY', 'Cayman Islands');
INSERT INTO `countries` VALUES ('CF', 'Central African Republic');
INSERT INTO `countries` VALUES ('TD', 'Chad');
INSERT INTO `countries` VALUES ('CL', 'Chile');
INSERT INTO `countries` VALUES ('CN', 'China');
INSERT INTO `countries` VALUES ('CX', 'Christmas Island');
INSERT INTO `countries` VALUES ('CC', 'Cocos (Keeling) Islands');
INSERT INTO `countries` VALUES ('CO', 'Colombia');
INSERT INTO `countries` VALUES ('KM', 'Comoros');
INSERT INTO `countries` VALUES ('CG', 'Congo');
INSERT INTO `countries` VALUES ('CD', 'Congo, The Democratic Republic of the');
INSERT INTO `countries` VALUES ('CK', 'Cook Islands');
INSERT INTO `countries` VALUES ('CR', 'Costa Rica');
INSERT INTO `countries` VALUES ('CI', 'Cote d''Ivoire');
INSERT INTO `countries` VALUES ('HR', 'Croatia');
INSERT INTO `countries` VALUES ('CU', 'Cuba');
INSERT INTO `countries` VALUES ('CY', 'Cyprus');
INSERT INTO `countries` VALUES ('CZ', 'Czech Republic');
INSERT INTO `countries` VALUES ('DK', 'Denmark');
INSERT INTO `countries` VALUES ('DJ', 'Djibouti');
INSERT INTO `countries` VALUES ('DM', 'Dominica');
INSERT INTO `countries` VALUES ('DO', 'Dominican Republic');
INSERT INTO `countries` VALUES ('EC', 'Ecuador');
INSERT INTO `countries` VALUES ('EG', 'Egypt');
INSERT INTO `countries` VALUES ('SV', 'El Salvador');
INSERT INTO `countries` VALUES ('GQ', 'Equatorial Guinea');
INSERT INTO `countries` VALUES ('ER', 'Eritrea');
INSERT INTO `countries` VALUES ('EE', 'Estonia');
INSERT INTO `countries` VALUES ('ET', 'Ethiopia');
INSERT INTO `countries` VALUES ('FK', 'Falkland Islands (Malvinas)');
INSERT INTO `countries` VALUES ('FO', 'Faroe Islands');
INSERT INTO `countries` VALUES ('FJ', 'Fiji');
INSERT INTO `countries` VALUES ('FI', 'Finland');
INSERT INTO `countries` VALUES ('FR', 'France');
INSERT INTO `countries` VALUES ('GF', 'French Guiana');
INSERT INTO `countries` VALUES ('PF', 'French Polynesia');
INSERT INTO `countries` VALUES ('TF', 'French Southern Territories');
INSERT INTO `countries` VALUES ('GA', 'Gabon');
INSERT INTO `countries` VALUES ('GM', 'Gambia');
INSERT INTO `countries` VALUES ('GE', 'Georgia');
INSERT INTO `countries` VALUES ('DE', 'Germany');
INSERT INTO `countries` VALUES ('GH', 'Ghana');
INSERT INTO `countries` VALUES ('GI', 'Gibraltar');
INSERT INTO `countries` VALUES ('GR', 'Greece');
INSERT INTO `countries` VALUES ('GL', 'Greenland');
INSERT INTO `countries` VALUES ('GD', 'Grenada');
INSERT INTO `countries` VALUES ('GP', 'Guadeloupe');
INSERT INTO `countries` VALUES ('GU', 'Guam');
INSERT INTO `countries` VALUES ('GT', 'Guatemala');
INSERT INTO `countries` VALUES ('GG', 'Guernsey');
INSERT INTO `countries` VALUES ('GN', 'Guinea');
INSERT INTO `countries` VALUES ('GW', 'Guinea-Bissau');
INSERT INTO `countries` VALUES ('GY', 'Guyana');
INSERT INTO `countries` VALUES ('HT', 'Haiti');
INSERT INTO `countries` VALUES ('HM', 'Heard Island and McDonald Islands');
INSERT INTO `countries` VALUES ('VA', 'Holy See (Vatican City State)');
INSERT INTO `countries` VALUES ('HN', 'Honduras');
INSERT INTO `countries` VALUES ('HK', 'Hong Kong');
INSERT INTO `countries` VALUES ('HU', 'Hungary');
INSERT INTO `countries` VALUES ('IS', 'Iceland');
INSERT INTO `countries` VALUES ('IN', 'India');
INSERT INTO `countries` VALUES ('ID', 'Indonesia');
INSERT INTO `countries` VALUES ('IR', 'Iran');
INSERT INTO `countries` VALUES ('IQ', 'Iraq');
INSERT INTO `countries` VALUES ('IE', 'Ireland');
INSERT INTO `countries` VALUES ('IM', 'Isle of Man');
INSERT INTO `countries` VALUES ('IL', 'Israel');
INSERT INTO `countries` VALUES ('IT', 'Italy');
INSERT INTO `countries` VALUES ('JM', 'Jamaica');
INSERT INTO `countries` VALUES ('JP', 'Japan');
INSERT INTO `countries` VALUES ('JE', 'Jersey');
INSERT INTO `countries` VALUES ('JO', 'Jordan');
INSERT INTO `countries` VALUES ('KZ', 'Kazakhstan');
INSERT INTO `countries` VALUES ('KE', 'Kenya');
INSERT INTO `countries` VALUES ('KI', 'Kiribati');
INSERT INTO `countries` VALUES ('KR', 'Korea');
INSERT INTO `countries` VALUES ('KW', 'Kuwait');
INSERT INTO `countries` VALUES ('KG', 'Kyrgyzstan');
INSERT INTO `countries` VALUES ('LA', 'Lao People''s Democratic Republic');
INSERT INTO `countries` VALUES ('LV', 'Latvia');
INSERT INTO `countries` VALUES ('LB', 'Lebanon');
INSERT INTO `countries` VALUES ('LS', 'Lesotho');
INSERT INTO `countries` VALUES ('LR', 'Liberia');
INSERT INTO `countries` VALUES ('LY', 'Libyan Arab Jamahiriya');
INSERT INTO `countries` VALUES ('LI', 'Liechtenstein');
INSERT INTO `countries` VALUES ('LT', 'Lithuania');
INSERT INTO `countries` VALUES ('LU', 'Luxembourg');
INSERT INTO `countries` VALUES ('MO', 'Macau');
INSERT INTO `countries` VALUES ('MK', 'Macedonia');
INSERT INTO `countries` VALUES ('MG', 'Madagascar');
INSERT INTO `countries` VALUES ('MW', 'Malawi');
INSERT INTO `countries` VALUES ('MY', 'Malaysia');
INSERT INTO `countries` VALUES ('MV', 'Maldives');
INSERT INTO `countries` VALUES ('ML', 'Mali');
INSERT INTO `countries` VALUES ('MT', 'Malta');
INSERT INTO `countries` VALUES ('MH', 'Marshall Islands');
INSERT INTO `countries` VALUES ('MQ', 'Martinique');
INSERT INTO `countries` VALUES ('MR', 'Mauritania');
INSERT INTO `countries` VALUES ('MU', 'Mauritius');
INSERT INTO `countries` VALUES ('YT', 'Mayotte');
INSERT INTO `countries` VALUES ('MX', 'Mexico');
INSERT INTO `countries` VALUES ('FM', 'Micronesia, Federated States of');
INSERT INTO `countries` VALUES ('MD', 'Moldova');
INSERT INTO `countries` VALUES ('MC', 'Monaco');
INSERT INTO `countries` VALUES ('MN', 'Mongolia');
INSERT INTO `countries` VALUES ('ME', 'Montenegro');
INSERT INTO `countries` VALUES ('MS', 'Montserrat');
INSERT INTO `countries` VALUES ('MA', 'Morocco');
INSERT INTO `countries` VALUES ('MZ', 'Mozambique');
INSERT INTO `countries` VALUES ('MM', 'Myanmar');
INSERT INTO `countries` VALUES ('NA', 'Namibia');
INSERT INTO `countries` VALUES ('NR', 'Nauru');
INSERT INTO `countries` VALUES ('NP', 'Nepal');
INSERT INTO `countries` VALUES ('NL', 'Netherlands');
INSERT INTO `countries` VALUES ('AN', 'Netherlands Antilles');
INSERT INTO `countries` VALUES ('NC', 'New Caledonia');
INSERT INTO `countries` VALUES ('NZ', 'New Zealand');
INSERT INTO `countries` VALUES ('NI', 'Nicaragua');
INSERT INTO `countries` VALUES ('NE', 'Niger');
INSERT INTO `countries` VALUES ('NG', 'Nigeria');
INSERT INTO `countries` VALUES ('NU', 'Niue');
INSERT INTO `countries` VALUES ('NF', 'Norfolk Island');
INSERT INTO `countries` VALUES ('MP', 'Northern Mariana Islands');
INSERT INTO `countries` VALUES ('NO', 'Norway');
INSERT INTO `countries` VALUES ('OM', 'Oman');
INSERT INTO `countries` VALUES ('PK', 'Pakistan');
INSERT INTO `countries` VALUES ('PW', 'Palau');
INSERT INTO `countries` VALUES ('PS', 'Palestinian Territory, Occupied');
INSERT INTO `countries` VALUES ('PA', 'Panama');
INSERT INTO `countries` VALUES ('PG', 'Papua New Guinea');
INSERT INTO `countries` VALUES ('PY', 'Paraguay');
INSERT INTO `countries` VALUES ('PE', 'Peru');
INSERT INTO `countries` VALUES ('PH', 'Philippines');
INSERT INTO `countries` VALUES ('PN', 'Pitcairn');
INSERT INTO `countries` VALUES ('PL', 'Poland');
INSERT INTO `countries` VALUES ('PT', 'Portugal');
INSERT INTO `countries` VALUES ('PR', 'Puerto Rico');
INSERT INTO `countries` VALUES ('QA', 'Qatar');
INSERT INTO `countries` VALUES ('RE', 'Reunion');
INSERT INTO `countries` VALUES ('RO', 'Romania');
INSERT INTO `countries` VALUES ('RU', 'Russia');
INSERT INTO `countries` VALUES ('RW', 'Rwanda');
INSERT INTO `countries` VALUES ('BL', 'Saint Barth�lemy');
INSERT INTO `countries` VALUES ('SH', 'Saint Helena');
INSERT INTO `countries` VALUES ('KN', 'Saint Kitts and Nevis');
INSERT INTO `countries` VALUES ('LC', 'Saint Lucia');
INSERT INTO `countries` VALUES ('MF', 'Saint Martin');
INSERT INTO `countries` VALUES ('PM', 'Saint Pierre and Miquelon');
INSERT INTO `countries` VALUES ('VC', 'Saint Vincent and the Grenadines');
INSERT INTO `countries` VALUES ('WS', 'Samoa');
INSERT INTO `countries` VALUES ('SM', 'San Marino');
INSERT INTO `countries` VALUES ('ST', 'Sao Tome and Principe');
INSERT INTO `countries` VALUES ('SA', 'Saudi Arabia');
INSERT INTO `countries` VALUES ('SN', 'Senegal');
INSERT INTO `countries` VALUES ('RS', 'Serbia');
INSERT INTO `countries` VALUES ('SC', 'Seychelles');
INSERT INTO `countries` VALUES ('SL', 'Sierra Leone');
INSERT INTO `countries` VALUES ('SG', 'Singapore');
INSERT INTO `countries` VALUES ('SK', 'Slovakia');
INSERT INTO `countries` VALUES ('SI', 'Slovenia');
INSERT INTO `countries` VALUES ('SB', 'Solomon Islands');
INSERT INTO `countries` VALUES ('SO', 'Somalia');
INSERT INTO `countries` VALUES ('ZA', 'South Africa');
INSERT INTO `countries` VALUES ('GS', 'South Georgia and the South Sandwich Islands');
INSERT INTO `countries` VALUES ('ES', 'Spain');
INSERT INTO `countries` VALUES ('LK', 'Sri Lanka');
INSERT INTO `countries` VALUES ('SD', 'Sudan');
INSERT INTO `countries` VALUES ('SR', 'Suriname');
INSERT INTO `countries` VALUES ('SJ', 'Svalbard and Jan Mayen');
INSERT INTO `countries` VALUES ('SZ', 'Swaziland');
INSERT INTO `countries` VALUES ('SE', 'Sweden');
INSERT INTO `countries` VALUES ('CH', 'Switzerland');
INSERT INTO `countries` VALUES ('SY', 'Syrian Arab Republic');
INSERT INTO `countries` VALUES ('TW', 'Taiwan');
INSERT INTO `countries` VALUES ('TJ', 'Tajikistan');
INSERT INTO `countries` VALUES ('TZ', 'Tanzania, United Republic of');
INSERT INTO `countries` VALUES ('TH', 'Thailand');
INSERT INTO `countries` VALUES ('TL', 'Timor-Leste');
INSERT INTO `countries` VALUES ('TG', 'Togo');
INSERT INTO `countries` VALUES ('TK', 'Tokelau');
INSERT INTO `countries` VALUES ('TO', 'Tonga');
INSERT INTO `countries` VALUES ('TT', 'Trinidad and Tobago');
INSERT INTO `countries` VALUES ('TN', 'Tunisia');
INSERT INTO `countries` VALUES ('TR', 'Turkey');
INSERT INTO `countries` VALUES ('TM', 'Turkmenistan');
INSERT INTO `countries` VALUES ('TC', 'Turks and Caicos Islands');
INSERT INTO `countries` VALUES ('TV', 'Tuvalu');
INSERT INTO `countries` VALUES ('UG', 'Uganda');
INSERT INTO `countries` VALUES ('UA', 'Ukraine');
INSERT INTO `countries` VALUES ('AE', 'United Arab Emirates');
INSERT INTO `countries` VALUES ('GB', 'United Kingdom');
INSERT INTO `countries` VALUES ('US', 'USA');
INSERT INTO `countries` VALUES ('UM', 'United States Minor Outlying Islands');
INSERT INTO `countries` VALUES ('UY', 'Uruguay');
INSERT INTO `countries` VALUES ('UZ', 'Uzbekistan');
INSERT INTO `countries` VALUES ('VU', 'Vanuatu');
INSERT INTO `countries` VALUES ('VE', 'Venezuela');
INSERT INTO `countries` VALUES ('VN', 'Vietnam');
INSERT INTO `countries` VALUES ('VG', 'Virgin Islands, British');
INSERT INTO `countries` VALUES ('VI', 'Virgin Islands, U.S.');
INSERT INTO `countries` VALUES ('WF', 'Wallis And Futuna');
INSERT INTO `countries` VALUES ('EH', 'Western Sahara');
INSERT INTO `countries` VALUES ('YE', 'Yemen');
INSERT INTO `countries` VALUES ('ZM', 'Zambia');
INSERT INTO `countries` VALUES ('ZW', 'Zimbabwe');



-- 
-- Table structure for table `formats`
-- 

CREATE TABLE `formats` (
  `id` tinyint(1) NOT NULL auto_increment,
  `name` varchar(12) NOT NULL,
  `times` tinyint(1) NOT NULL,
  `avgtype` tinyint(1) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 AUTO_INCREMENT=6 ;

-- 
-- Dumping data for table `formats`
-- 

INSERT INTO `formats` VALUES (1, 'average of 5', 5, 0);
INSERT INTO `formats` VALUES (2, 'mean of 3', 3, 1);
INSERT INTO `formats` VALUES (3, 'best of 3', 3, 2);
INSERT INTO `formats` VALUES (4, 'best of 2', 2, 2);
INSERT INTO `formats` VALUES (5, 'best of 1', 1, 2);

</code></pre>
