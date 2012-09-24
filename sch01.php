<?
class ScheduleClass
{
    protected $sectors = array();
	protected $nrounds = 1;
	protected $rounds = array();
	protected $ncolumns = 0;
	protected $categories;

	function __construct(&$categories)
	{
		$this->categories = &$categories;
	}

	function timeToSector($time)
	{
		if (strlen($time)!=4 || !intval($time,10)) return 0;
		$hour = intval(substr($time,0,2),10);
		if ($hour < 0 || $hour >= 24) return 0;
		$minute = intval(substr($time,2),10);
		if ($minute < 0 || $minute >= 60) return 0;
		return (($hour * 12) + floor($minute / 5));
	}

    public function addRound($start,$end,$evt,$altEvt,$rnd,$comment)
	{
		$start = $this->timeToSector($start);
		$end = $this->timeToSector($end);
		if ($end <= $start) die("Illegal start/end times ($evt/$rnd)");
		//
        $this->rounds[$this->nrounds]["st"] = $start;
        $this->rounds[$this->nrounds]["en"] = $end;
        $this->rounds[$this->nrounds]["ev"] = $evt;
		if ($altEvt)
	        $this->rounds[$this->nrounds]["ae"] = $altEvt;
		elseif ($this->categories[$evt])
			$this->rounds[$this->nrounds]["ae"] = $this->categories[$evt];
        $this->rounds[$this->nrounds]["rn"] = $rnd;
        $this->rounds[$this->nrounds]["co"] = $comment;
		//
		$c = -1;
		do {
			$c++;
			$r = $start;
			while ($r < $end && !$this->sectors[$c][$r]) $r++;
		} while ($r < $end);
		for ($r=$start;$r<$end;$r++) $this->sectors[$c][$r] = $this->nrounds;
        $this->rounds[$this->nrounds]["c"] = $c;
		if ($c > $this->ncolumns) $this->ncolumns = $c;
		//
		$this->nrounds++;
    }

	public function out(&$py,$pm,&$events,&$resultRnds,&$position)
	{
		global $IE;
		//
		for ($l=1;$l<$this->nrounds;$l++)
		{
			$c = $this->rounds[$l]["c"];
			if ($c < $this->ncolumns)
			{
				$this->rounds[$l]["sp"] = 1;
				$start = $this->rounds[$l]["st"];
				$end = $this->rounds[$l]["en"];
				do {
					$c++;
					$r = $start;
					while ($r < $end && !$this->sectors[$c][$r]) $r++;
					if ($r==$end) $this->rounds[$l]["sp"] = $this->rounds[$l]["sp"] + 1;
				} while ($r==$end && $c < $this->ncolumns);
			}
		}
		//
		$x = 0;
		$y = 0;
		while ($y < 288 && !$this->sectors[$x][$y])
		{
			if ($x==$this->ncolumns)
			{
				$x = 0;
				$y++;
			}
			else
				$x++;
		}
		if ($y==288) return "";
		$top_y = $y;
		$bottom_py = 0;
		if ($position!==null) $position_px = $py;
		//
		$ncolor = 0;
		$colors = array("#7381FB;","#FF939D;","#FFF977;","#85E377;","#FFA74F;","#ffffff;");
		//
		$echo  = "\r\n";
		$x = 0;
		$tr = false;
		while ($y < 288)
		{
			if (isset($this->sectors[$x][$y]) && $current[$x]!=$this->sectors[$x][$y])
			{
				$idx = $this->sectors[$x][$y];
				$evt = $this->rounds[$idx]["ev"];
				$current[$x] = $idx;
				$height = ($this->rounds[$idx]["en"] - $this->rounds[$idx]["st"]);
				$height_px = $height*8-10;
				$img_y = ($height<=6 ? -5 : 5);
				$npy = $py+($this->rounds[$idx]["st"]-$top_y)*8;
				if ($position!==null && $this->rounds[$idx]["st"] <= $position) $position_px = $npy;
				if ($npy+$height_px > $bottom_py) $bottom_py = $npy+$height_px;
				$echo .= "<span class=SCH style='background-color:";
				if (!$this->categories[$evt])
					$echo .= "#888;";
				else
				{
					$echo .= $colors[$ncolor];
					$ncolor = (($ncolor+1) % 6);
				}
				if (!$this->ncolumns) $this->rounds[$idx]["sp"] = 2;
				$echo .= "width:" .(max($this->rounds[$idx]["sp"],1)*200-($IE?10:20)). "px;".
					"height:" .$height_px. "px;".
					"left:".(5+$this->rounds[$idx]["c"]*200). "px;".
					"top:".$npy."px;'>";
				if ($this->categories[$evt] || $evt=="reg" || $evt=="tro" || $evt=="lun")
					$echo .= "<img border=0 src='img/".$evt.".gif' style='position:absolute;top:".$img_y."px;left:-5px;'>";
				//
				$echo .= "<span class=HR style='top:".($img_y+($height<=3?10:($height<=5?20:35)))."px;'><center>";
				$hour = floor($this->rounds[$idx]["st"] / 12);
				if (!$pm && $hour > 12) $hour -= 12;
				$hour = "$hour";
				if (strlen($hour)==1) $hour = "0".$hour;
				$minute = ($this->rounds[$idx]["st"] % 12)*5;
				if (strlen($minute)==1) $minute = "0".$minute;
				$echo .= "$hour:$minute";
				$echo .= "</center></span>";
				//
				if ($this->rounds[$idx]["rn"])
				{
					$h = ($IE?5:3);
					//$echo .= "<div style='margin:0 0 0 32px;'><h$h style='color:#114;margin:".($height<=6 ? 4 : 10)."px 0 0 0;". ($height<=3 ? "display:inline;" : "") ."'>" . $this->rounds[$idx]["ae"]."</h$h><b>";
					//if ($height<=3) $echo .= "&nbsp;&nbsp;&nbsp;";
					$echo .= "<div style='margin:0 0 0 32px;".($height<=5?"position:relative;top:". ($height<=3?"-2":"+3"). "px":"")."'><h$h style='color:#114;margin:".($height<=6 ? 4 : 10)."px 0 0 0;". ($height<=5 ? "display:inline;" : "") ."'>" . $this->rounds[$idx]["ae"]."</h$h><b>";
					if ($height<=5) $echo .= "&nbsp;&nbsp;&nbsp;";
					if (isset($events[_RX][$evt]))
					{
						$events[_RX][$evt] = $events[_RX][$evt] + 1;
						if ($events[_RX][$evt] <= $events[_RTOP][$evt])
							$echo .= "<a href='live.php?cid=" .$_GET["cid"]. "&cat=" .$events[_ID][$evt]. "&rnd=" .$events[_RX][$evt]. "'><img border=0 src='img/" .($resultRnds[$evt."_".$events[_RX][$evt]]?"g":"r"). "-arrow.gif'>&nbsp;" .$this->rounds[$idx]["rn"]. "</a>";
						else
							$echo .= $this->rounds[$idx]["rn"];
					}
					else
						$echo .= $this->rounds[$idx]["rn"];
					$echo .= "</b>";
					if ($this->rounds[$idx]["co"])
						//$echo .= ($height<=6 ? " - " : "<br>") . $this->rounds[$idx]["co"];
						$echo .= ($height<=8 ? " - " : "<br>") . $this->rounds[$idx]["co"];
					$echo .= "</div>";
				}
				else
				{
					//$h = ($height<=3? 3 : ($this->rounds[$idx]["sp"] <= 1 ? 2 : 1) );
					$h = ($height<=4? 3 : ($this->rounds[$idx]["sp"] <= 1 ? 2 : 1) );
					if ($IE)
					{
						$h++;
						$t = 0;
					}
					else
						$t = ($height<=3? -15 : ($height<=6? -12 : 0));
					$echo .= "<h$h style='position:relative;top:".$t."px;'><center>";
					if ($height > 20) $echo .= "<br>";
					$echo .= $this->rounds[$idx]["ae"];
					$echo .= "</center></h$h>";
				}
				$echo .= "</span>\r\n";
			}
			if ($x==$this->ncolumns)
			{
				$x = 0;
				$y++;
			}
			else
				$x++;
		}
		//
		$py = $bottom_py;
		if ($position!==null) $position = $position_px;
		return $echo;
	}
}
?>