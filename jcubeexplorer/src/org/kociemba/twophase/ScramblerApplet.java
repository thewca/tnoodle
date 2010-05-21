package org.kociemba.twophase;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;

import javax.swing.JApplet;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;

import org.kociemba.twophase.ScrambleCacher.ScrambleCacherListener;

@SuppressWarnings("serial")
public class ScramblerApplet extends JApplet implements ScrambleCacherListener {
	private JTextArea scroller;
	private JTextField sField;

	private JButton nbPage;
	private JButton nbWindow;
	private JFrame window;
	
	private ScrambleCacher scrambler;
	private boolean gui_enabled = false;
	
	public void init() {
		gui_enabled = "true".equals(getParameter("gui"));
		if(gui_enabled)
			initUI();
		scrambler = new ScrambleCacher();
		scrambler.addScrambleCacherListener(this);
		scrambleCacheUpdated(scrambler);
	}
	
	@Override
	public String[][] getParameterInfo() {
		return new String[][] {
				{"bg-color", "#hex", "sets the background color of this applet"},
				{"fg-color", "#hex", "sets the foreground color of this applet"},
				{"gui", "boolean", "if true, enables the gui. otherwise, this applet is only useful for javascript calls"},
		};
	}
	
	private static Color parseColor(String col, Color def) {
		try {
			if(col.startsWith("#")) col = col.substring(1);
			return new Color(Integer.parseInt(col, 16));
		} catch(Exception e) {
			return def;
		}
	}
	
	private void initUI() {
		setLayout(new BorderLayout());
		scroller = new JTextArea();
		scroller.setEditable(false);

		scroller.setBackground(parseColor(getParameter("bg-color"), Color.WHITE));
		scroller.setForeground(parseColor(getParameter("fg-color"), Color.BLACK));
		scroller.setFont(Font.getFont(Font.MONOSPACED));
		JScrollPane pane = new JScrollPane(scroller, JScrollPane.VERTICAL_SCROLLBAR_ALWAYS, JScrollPane.HORIZONTAL_SCROLLBAR_NEVER);
		add(pane, BorderLayout.CENTER);
		JPanel panel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
		panel.setBackground(java.awt.Color.WHITE);
		JButton popupWindow = new JButton("Popup Window");
		panel.add(popupWindow);
		nbPage = new JButton("New Scramble");
		panel.add(nbPage);
		add(panel, BorderLayout.SOUTH);
		
        window = new JFrame("Random State Cube Scrambler");
        sField = new JTextField();
        sField.setEditable(false);
        sField.setBackground(java.awt.Color.WHITE);
        sField.setFont(Font.getFont(Font.MONOSPACED));
        nbWindow = new JButton("New Scramble");
        window.add(sField, BorderLayout.CENTER);
        window.add(nbWindow, BorderLayout.EAST);
        window.setSize(new Dimension(550, 58));
		
        window.setDefaultCloseOperation(JFrame.HIDE_ON_CLOSE);
        popupWindow.addActionListener(new ActionListener(){
			public void actionPerformed(ActionEvent arg0){
				window.setVisible(true);
            }
		});
		final KeyListener k = new KeyAdapter(){
			public void keyPressed(KeyEvent e){
				if(e.getKeyCode() == KeyEvent.VK_ENTER) {
					newScramble();
				}
            }
		};
		final ActionListener requestScrambleAction = new ActionListener() {
			public void actionPerformed(ActionEvent arg0) {
				newScramble();
			}
		};
		scroller.addKeyListener(k);
		panel.addKeyListener(k);
		nbPage.addKeyListener(k);
		nbPage.addActionListener(requestScrambleAction);
        sField.addKeyListener(k);
        nbWindow.addActionListener(requestScrambleAction);
        nbWindow.addKeyListener(k);
	}
	
	
	/**
	 * This method updates the gui (if enabled) and returns a new scramble.
	 * This is extremely useful for javascript applications.
	 * @return The new scramble.
	 */
	public String newScramble() {
		String s = scrambler.newScramble();
		if(gui_enabled) {
			sField.setText(s);
			scroller.append(s + "\n");
			scroller.setCaretPosition(scroller.getDocument().getLength());
		}
        return s;
	}
	
	@Override
	public void scrambleCacheUpdated(ScrambleCacher src) {
		final int available = src.getAvailableCount();
		SwingUtilities.invokeLater(new Runnable() {
			public void run() {
				if(gui_enabled) {
					nbPage.setEnabled(available > 0);
					nbWindow.setEnabled(available > 0);
				}
				showStatus(available + " scrambles available");
			}
		});
	}
	
	public static void main(String[] args) {
		CoordCube.setDebug(true);
		CoordCube.init();

		for(int i = 0; i < 2; i++) {
			long start = System.nanoTime();
			String rCube = Tools.randomCube();
			System.out.println("Solving cube:\n" + rCube);
			String solution = Search.solution(rCube, 30, 10000, false);
			System.out.println("\nSolution:\n" + solution);
			System.out.println("\nScramble:\n" + Tools.invert(solution));
			System.out.println("That took " + (System.nanoTime()-start)/1e9 + " seconds.\n");
		}
	}
}
