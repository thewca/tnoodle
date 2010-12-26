package net.gnehzr.tnoodle.test;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Cursor;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Point;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.awt.geom.GeneralPath;
import java.awt.image.BufferedImage;
import java.util.HashMap;
import java.util.SortedMap;

import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JComponent;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.SwingUtilities;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Scrambler;
import net.gnehzr.tnoodle.scrambles.ScramblerViewer;

@SuppressWarnings("serial")
public class ScrambleTest {
	private HashMap<String, Color> colorScheme = null;
	private HashMap<String, GeneralPath> faceBoundaries = null;
	private BufferedImage scrambleImg = null;
	
	private JLabel imageLabel;
	
	private SortedMap<String, Scrambler> scramblers;
	public ScrambleTest() {
		scramblers = Scrambler.getScramblers(null);
		if(scramblers == null) {
			JOptionPane.showMessageDialog(null, "Could not find scramble plugins");
			return;
		}
		
		JFrame tester = new JFrame("Scramble Tester");
		tester.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		
		final JTextArea scrambleArea = new JTextArea(5, 25);
		scrambleArea.setLineWrap(true);
		tester.add(new JScrollPane(scrambleArea), BorderLayout.NORTH);

		imageLabel = new JLabel() {
			@Override
			public void paint(Graphics g) {
				if(scrambleImg != null) {
					double ratio = 1.0*scrambleImg.getWidth() / scrambleImg.getHeight();
					int height1 = getHeight();
					int width1 = (int) (ratio*height1);
					int width2 = getWidth();
					int height2 = (int) (width2/ratio);
					int width = Math.min(width1, width2);
					int height = Math.min(height1, height2);
					g.drawImage(scrambleImg, 0, 0, width, height, null);
				}
			}
		};
		imageLabel.addMouseMotionListener(new MouseMotionListener() {
			@Override
			public void mouseMoved(MouseEvent e) {
				String currFace = getFaceUnderMouse();
				if(currFace != null)
					imageLabel.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
				else
					imageLabel.setCursor(Cursor.getDefaultCursor());
			}
			
			@Override
			public void mouseDragged(MouseEvent e) {
				
			}
		});
		imageLabel.addMouseListener(new MouseListener() {
			
			@Override
			public void mouseReleased(MouseEvent e) {}
			
			@Override
			public void mousePressed(MouseEvent e) {}
			
			@Override
			public void mouseExited(MouseEvent e) {
				
			}
			
			@Override
			public void mouseEntered(MouseEvent e) {}
			
			@Override
			public void mouseClicked(MouseEvent e) {
				String currFace = getFaceUnderMouse();
				if(currFace != null)
					System.out.println(currFace);
			}
		});
		
		imageLabel.setPreferredSize(new Dimension(0, 100));
		tester.add(imageLabel, BorderLayout.CENTER);
		
		final JComboBox puzzleBox = new JComboBox(scramblers.values().toArray());
		JButton requestScramble = new JButton("Scramble!");
		requestScramble.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				Scrambler puzzle = (Scrambler) puzzleBox.getSelectedItem();
				String scramble = puzzle.generateScramble();
				scrambleArea.setText(scramble);
				if(puzzle instanceof ScramblerViewer) {
					ScramblerViewer sig = (ScramblerViewer) puzzle;

					scrambleImg = new BufferedImage(imageLabel.getWidth(), imageLabel.getHeight(), BufferedImage.TYPE_INT_ARGB);
					try {
						sig.drawScramble(scrambleImg.createGraphics(), imageLabel.getSize(), scramble, colorScheme);
					} catch (InvalidScrambleException e1) {
						e1.printStackTrace();
					}
					faceBoundaries = sig.getDefaultFaceBoundaries();
					if(colorScheme == null) {
						colorScheme = sig.getDefaultColorScheme();
					}
					imageLabel.repaint();
				}
			}
		});
		tester.add(sideBySide(puzzleBox, requestScramble), BorderLayout.SOUTH);
		tester.pack();
		tester.setMinimumSize(tester.getPreferredSize());
		tester.setVisible(true);
	}
	

	private String getFaceUnderMouse() {
		if(faceBoundaries == null) return null;
		Point p = imageLabel.getMousePosition();
		for(String face : faceBoundaries.keySet()) {
			if(faceBoundaries.get(face).contains(p)) {
				return face;
			}
		}
		return null;
	}

	
	private static JPanel sideBySide(JComponent... components) {
		JPanel panel = new JPanel();
		for(Component c : components)
			panel.add(c);
		return panel;
	}
	
	public static void main(String[] args) {
		SwingUtilities.invokeLater(new Runnable() {
			@Override
			public void run() {
				new ScrambleTest();
			}
		});
	}

}
