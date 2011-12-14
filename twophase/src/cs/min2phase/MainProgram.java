package cs.min2phase;

import cs.min2phase.Tools;
import cs.min2phase.Search;

import javax.swing.*;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;
import java.awt.Color;
import java.awt.event.*;

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//A simple GUI example to demonstrate how to use the package org.kociemba.twophase

/**
 * This code was edited or generated using CloudGarden's Jigloo SWT/Swing GUI Builder, which is free for non-commercial
 * use. If Jigloo is being used commercially (ie, by a corporation, company or business for any purpose whatever) then
 * you should purchase a license for each developer using Jigloo. Please visit www.cloudgarden.com for details. Use of
 * Jigloo implies acceptance of these licensing terms. A COMMERCIAL LICENSE HAS NOT BEEN PURCHASED FOR THIS MACHINE, SO
 * JIGLOO OR THIS CODE CANNOT BE USED LEGALLY FOR ANY CORPORATE OR COMMERCIAL PURPOSE.
 */
public class MainProgram extends javax.swing.JFrame {

	// +++++++++++++These variables used only in the GUI-interface+++++++++++++++++++++++++++++++++++++++++++++++++++++++
	private static final long serialVersionUID = 1L;
	private JButton[][] facelet = new JButton[6][9];
	private final JButton[] colorSel = new JButton[6];
	private final int FSIZE = 45;
	private final int[] XOFF = { 3, 6, 3, 3, 0, 9 };// Offsets for facelet display
	private final int[] YOFF = { 0, 3, 3, 6, 3, 3 };
	private final Color[] COLORS = { Color.white, Color.red, Color.green, Color.yellow, Color.orange, Color.blue };
	private JCheckBox checkBoxShowStr;
	private JButton buttonRandom;
	private JCheckBox checkBoxUseSep;
	private JCheckBox checkBoxInv;

	private JButton Solve;
	private JLabel jLabel2;
	private JLabel jLabel1;
	private JSpinner spinnerMaxMoves;
	private JSpinner spinnerTimeout;
	private Color curCol = COLORS[0];
	private int maxDepth = 21, maxTime = 5;
	boolean useSeparator = true;
	boolean showString = false;
	boolean inverse = false;
	Search search = new Search();

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	public static void main(String[] args) {
		Tools.init();
		SwingUtilities.invokeLater(new Runnable() {
			public void run() {
				MainProgram inst = new MainProgram();
				inst.setLocationRelativeTo(null);
				inst.setVisible(true);
			}
		});
	}

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	public MainProgram() {
		super();
		initGUI();
	}

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	private void initGUI() {

		getContentPane().setLayout(null);
		setDefaultCloseOperation(WindowConstants.DISPOSE_ON_CLOSE);
		this.setTitle("Two-Phase Package GUI-Example");

		// ++++++++++++++++++++++++++++++++++ Set up Solve Cube Button ++++++++++++++++++++++++++++++++++++++++++++++++++++
		Solve = new JButton("Solve Cube");
		getContentPane().add(Solve);
		Solve.setBounds(422, 64, 114, 48);
		Solve.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent evt) {
				solveCube(evt);
			}
		});

		// ++++++++++++++++++++++++++++++++++ Set up Move Limit Spinner +++++++++++++++++++++++++++++++++++++++++++++++++++
		{
			jLabel1 = new JLabel();
			getContentPane().add(jLabel1);
			jLabel1.setText("Move Limit");
			jLabel1.setBounds(282, 65, 72, 16);
		}
		{
			SpinnerModel model = new SpinnerNumberModel(21, 1, 24, 1);
			spinnerMaxMoves = new JSpinner(model);
			getContentPane().add(spinnerMaxMoves);
			spinnerMaxMoves.setBounds(354, 62, 56, 21);
			spinnerMaxMoves.getEditor().setPreferredSize(new java.awt.Dimension(37, 19));
			spinnerMaxMoves.addChangeListener(new ChangeListener() {
				public void stateChanged(ChangeEvent evt) {
					maxDepth = ((Integer) spinnerMaxMoves.getValue()).intValue();
				}
			});
		}

		// ++++++++++++++++++++++++++++++++++ Set up Time Limit Spinner +++++++++++++++++++++++++++++++++++++++++++++++++++
		{
			jLabel2 = new JLabel();
			getContentPane().add(jLabel2);
			jLabel2.setText("Time Limit");
			jLabel2.setBounds(282, 93, 72, 16);
		}
		{
			SpinnerModel model = new SpinnerNumberModel(5, 1, 3600, 1);
			spinnerTimeout = new JSpinner(model);
			getContentPane().add(spinnerTimeout);
			spinnerTimeout.setModel(model);
			spinnerTimeout.setBounds(354, 90, 56, 21);
			spinnerTimeout.getEditor().setPreferredSize(new java.awt.Dimension(36, 17));
			spinnerTimeout.addChangeListener(new ChangeListener() {
				public void stateChanged(ChangeEvent evt) {
					maxTime = ((Integer) spinnerTimeout.getValue()).intValue();
				}
			});
		}

		// ++++++++++++++++++++++++++++++++++ Set up Use Separator CheckBox +++++++++++++++++++++++++++++++++++++++++++++++
		{
			checkBoxInv = new JCheckBox("Inverse", false);
			getContentPane().add(checkBoxInv);
			checkBoxInv.setBounds(12, 297, 121, 20);
			checkBoxInv.addActionListener(new ActionListener() {
				public void actionPerformed(ActionEvent evt) {
					inverse = checkBoxInv.isSelected();
				}
			});
			checkBoxUseSep = new JCheckBox("Use Separator", true);
			getContentPane().add(checkBoxUseSep);
			checkBoxUseSep.setBounds(12, 320, 121, 20);
			checkBoxUseSep.addActionListener(new ActionListener() {
				public void actionPerformed(ActionEvent evt) {
					useSeparator = checkBoxUseSep.isSelected();
				}
			});
		}
		{
			checkBoxShowStr = new JCheckBox("Show String", false);
			getContentPane().add(checkBoxShowStr);
			checkBoxShowStr.setBounds(12, 343, 121, 20);
			checkBoxShowStr.addActionListener(new ActionListener() {
				public void actionPerformed(ActionEvent evt) {
					showString = checkBoxShowStr.isSelected();
				}
			});
		}

		// ++++++++++++++++++++++++++++++++++ Set up Random Button ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		{
			buttonRandom = new JButton("Random Cube");
			getContentPane().add(buttonRandom);
			buttonRandom.setBounds(422, 17, 114, 22);
			buttonRandom.setText("Scramble");
			buttonRandom.addActionListener(new ActionListener() {
				public void actionPerformed(ActionEvent evt) {
					// +++++++++++++++++++++++++++++ Call Random function from package org.kociemba.twophase ++++++++++++++++++++
					String r = Tools.randomCube();
					// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
					for (int i = 0; i < 6; i++)
						for (int j = 0; j < 9; j++) {
							switch (r.charAt(9 * i + j)) {
							case 'U':
								facelet[i][j].setBackground(COLORS[0]);
								break;
							case 'R':
								facelet[i][j].setBackground(COLORS[1]);
								break;
							case 'F':
								facelet[i][j].setBackground(COLORS[2]);
								break;
							case 'D':
								facelet[i][j].setBackground(COLORS[3]);
								break;
							case 'L':
								facelet[i][j].setBackground(COLORS[4]);
								break;
							case 'B':
								facelet[i][j].setBackground(COLORS[5]);
								break;
							}
						}
				}
			});
		}

		// ++++++++++++++++++++++++++++++++++ Set up editable facelets ++++++++++++++++++++++++++++++++++++++++++++++++++++
		for (int i = 0; i < 6; i++)
			for (int j = 0; j < 9; j++) {
				facelet[i][j] = new JButton();
				getContentPane().add(facelet[i][j]);
				facelet[i][j].setBackground(Color.gray);
				facelet[i][j].setRolloverEnabled(false);
				facelet[i][j].setOpaque(true);
				facelet[i][j].setBounds(FSIZE * XOFF[i] + FSIZE * (j % 3), FSIZE * YOFF[i] + FSIZE * (j / 3), FSIZE, FSIZE);
				facelet[i][j].addActionListener(new ActionListener() {
					public void actionPerformed(ActionEvent evt) {
						((JButton) evt.getSource()).setBackground(curCol);
					}
				});
			}
		String[] txt = { "U", "R", "F", "D", "L", "B" };
		for (int i = 0; i < 6; i++)
			facelet[i][4].setText(txt[i]);
		for (int i = 0; i < 6; i++) {
			colorSel[i] = new JButton();
			getContentPane().add(colorSel[i]);
			colorSel[i].setBackground(COLORS[i]);
			colorSel[i].setOpaque(true);
			colorSel[i].setBounds(FSIZE * (XOFF[1] + 1) + FSIZE / 4 * 3 * i, FSIZE * (YOFF[3] + 1), FSIZE / 4 * 3,
					FSIZE / 4 * 3);
			colorSel[i].setName("" + i);
			colorSel[i].addActionListener(new ActionListener() {
				public void actionPerformed(ActionEvent evt) {
					curCol = COLORS[Integer.parseInt(((JButton) evt.getSource()).getName())];
				}
			});

		}
		pack();
		this.setSize(556, 441);
	}

	// ++++++++++++++++++++++++++++++++++++ End initGUI +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	// +++++++++++++++++++++++++++++++ Generate cube from GUI-Input and solve it ++++++++++++++++++++++++++++++++++++++++
	private void solveCube(ActionEvent evt) {
		StringBuffer s = new StringBuffer(54);

		for (int i = 0; i < 54; i++)
			s.insert(i, 'B');// default initialization

		for (int i = 0; i < 6; i++)
			// read the 54 facelets
			for (int j = 0; j < 9; j++) {
				if (facelet[i][j].getBackground() == facelet[0][4].getBackground())
					s.setCharAt(9 * i + j, 'U');
				if (facelet[i][j].getBackground() == facelet[1][4].getBackground())
					s.setCharAt(9 * i + j, 'R');
				if (facelet[i][j].getBackground() == facelet[2][4].getBackground())
					s.setCharAt(9 * i + j, 'F');
				if (facelet[i][j].getBackground() == facelet[3][4].getBackground())
					s.setCharAt(9 * i + j, 'D');
				if (facelet[i][j].getBackground() == facelet[4][4].getBackground())
					s.setCharAt(9 * i + j, 'L');
				if (facelet[i][j].getBackground() == facelet[5][4].getBackground())
					s.setCharAt(9 * i + j, 'B');
			}

		String cubeString = s.toString();
		if (showString) {
			JOptionPane.showMessageDialog(null, "Cube Definiton String: " + cubeString);
		}
		long t = System.nanoTime();
		// ++++++++++++++++++++++++ Call Search.solution method from package org.kociemba.twophase ++++++++++++++++++++++++
		String result = search.solution(cubeString, maxDepth, maxTime << 10, useSeparator, inverse);
		t = System.nanoTime() - t;

		// +++++++++++++++++++ Replace the error messages with more meaningful ones in your language ++++++++++++++++++++++
		if (result.contains("Error"))
			switch (result.charAt(result.length() - 1)) {
			case '1':
				result = "There are not exactly nine facelets of each color!";
				break;
			case '2':
				result = "Not all 12 edges exist exactly once!";
				break;
			case '3':
				result = "Flip error: One edge has to be flipped!";
				break;
			case '4':
				result = "Not all 8 corners exist exactly once!";
				break;
			case '5':
				result = "Twist error: One corner has to be twisted!";
				break;
			case '6':
				result = "Parity error: Two corners or two edges have to be exchanged!";
				break;
			case '7':
				result = "No solution exists for the given maximum move number!";
				break;
			case '8':
				result = "Timeout, no solution found within given maximum time!";
				break;
			}
		JOptionPane.showMessageDialog(null, result, Double.toString((t/1000)/1000.0) + "ms", JOptionPane.INFORMATION_MESSAGE);
		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	}
}
