package net.gnehzr.tnoodle.stackmat;

import java.applet.Applet;
import java.awt.Graphics;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

import javax.sound.sampled.LineUnavailableException;

import net.gnehzr.tnoodle.stackmat.StackmatInterpreter;
import net.gnehzr.tnoodle.stackmat.StackmatState;
import netscape.javascript.JSException;
import netscape.javascript.JSObject;

@SuppressWarnings("serial")
public class StackApplet extends Applet implements PropertyChangeListener {
	private StackmatInterpreter stackmat;
	private JSObject jso;
	private String updateCallback, errorCallback;
	private int mixer, stackmatValue;
	public void init() {
		try {
			jso = JSObject.getWindow(this);
		} catch(Exception e) {
			e.printStackTrace();
			// we absolutely need a jso object for this applet to function at all
			return;
		}
		updateCallback = getString("updateCallback", null);
		errorCallback = getString("errorCallback", null);
		mixer = parseInt("mixer", -1);
		stackmatValue = parseInt("stackmatValue", -1);
	}
	
	private String getString(String param, String def) {
		String val = null;
		try {
			val = getParameter(param);
		} catch(Exception e) {}
		return val;
	}
	
	private int parseInt(String param, int def) {
		try {
			return Integer.parseInt(getParameter(param));
		} catch(Exception e) {
			return def;
		}
	}
	
	@Override
	public void start() {
		try {
			stackmat = new StackmatInterpreter(-1, mixer, stackmatValue);
			stackmat.addPropertyChangeListener(this);
			stackmat.execute();
		} catch(SecurityException e) {
			e.printStackTrace();
			jso.call(errorCallback, new Object[] { "Security error" });
		} catch(LineUnavailableException e) {
			e.printStackTrace();
			jso.call(errorCallback, new Object[] { "Line unavailable" });
		} catch(IllegalArgumentException e) {
			e.printStackTrace();
			jso.call(errorCallback, new Object[] { "Line unavailable" });
		}
	}
	
	@Override
	public void stop() {
		if(stackmat != null)
			stackmat.cancel(true);
	}
	
	//TODO - check for stackmat == null in all of the following methods?
	public void setStackmatValue(int value) {
		stackmat.setStackmatValue(value);
	}

	public boolean isInvertedMinutes() {
		return stackmat.isInvertedMinutes();
	}
	public boolean isInvertedSeconds() {
		return stackmat.isInvertedSeconds();
	}
	public boolean isInvertedCentis() {
		return stackmat.isInvertedCentis();
	}
	public void setInverted(boolean minutes, boolean seconds, boolean hundredths) {
		stackmat.setInverted(minutes, seconds, hundredths);
	}
	public boolean isOn() {
		return stackmat.isOn();
	}
	
	public void paint(Graphics g) {
		if(state != null) {
			g.drawString(""+state.centis + " " + state.running, 10, 20);
			String left = state.leftHand ? "\\" : "";
			String right = state.rightHand ? "/" : "";
			g.drawString(left + " " + right, 10, 40);
		}
		if(stackmat != null)
			g.drawString("" + stackmat.isOn(), 10, 60);
	}
	private StackmatState state;
	public void propertyChange(PropertyChangeEvent evt) {
		if(evt.getNewValue() instanceof StackmatState)
			state = (StackmatState) evt.getNewValue();
		repaint();
		
		if(jso != null) {
			try {
				jso.call(updateCallback, new Object[] { state });
			} catch(JSException e) {} //this is if the method doesn't exist
		}
	}
	
//	public static void main(String[] args) {
//		final StackApplet a = new StackApplet();
//		a.init();
//		a.setPreferredSize(new Dimension(400, 500));
//		SwingUtilities.invokeLater(new Runnable() {
//			public void run() {
//				JFrame f = new JFrame();
//				f.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
//				JPanel pane = new JPanel();
//				f.setContentPane(pane);
//				f.add(a);
//				f.pack();
//				f.setVisible(true);
//			}
//		});
//	}
}
