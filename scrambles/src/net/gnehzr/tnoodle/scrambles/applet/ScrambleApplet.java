package net.gnehzr.tnoodle.scrambles.applet;

import java.util.SortedMap;

import javax.swing.JApplet;

import net.gnehzr.tnoodle.scrambles.ScrambleGenerator;
import netscape.javascript.JSObject;

@SuppressWarnings("serial")
public class ScrambleApplet extends JApplet {
	private JSObject js;

	@Override
	public void init() {
		js = JSObject.getWindow(this);
		String callback = getParameter("onload");
		
		SortedMap<String, ScrambleGenerator> scramblers = ScrambleGenerator.getScrambleGenerators(null);
		if(callback != null) {
			//TODO - apparently callback must be a top level function?
			//something like tnoodle.scrambles.test doesn't work
			js.call(callback, new Object[] {scramblers});
		}
	}
	
	@Override
	public boolean isFocusable() {
		return false;
	}
}
