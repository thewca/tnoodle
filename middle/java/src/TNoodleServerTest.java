import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.image.BufferedImage;

import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.SwingUtilities;

import org.apache.commons.lang.StringUtils;


public class TNoodleServerTest {

	private BufferedImage scrambleImg = null;
	private TNoodleServer server;
	public TNoodleServerTest(String host, int port) {
		server = new TNoodleServer(host, port);
		
		JFrame tester = new JFrame(server.toString());
		tester.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
		
		final JTextArea scrambleArea = new JTextArea(5, 25);
		scrambleArea.setLineWrap(true);
		tester.add(new JScrollPane(scrambleArea), BorderLayout.NORTH);

		@SuppressWarnings("serial")
		final JLabel image = new JLabel() {
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
		image.setPreferredSize(new Dimension(0, 100));
		tester.add(image, BorderLayout.CENTER);
		
		final JComboBox puzzleBox = new JComboBox(server.getAvailablePuzzles());
		puzzleBox.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				String puzzle = (String) puzzleBox.getSelectedItem();
				String scramble = StringUtils.join(server.getScramble(puzzle), " ");
				scrambleArea.setText(scramble);
				scrambleImg = server.getScrambleImage(puzzle, scramble, image.getWidth(), image.getHeight());
				image.repaint();
			}
		});
		tester.add(puzzleBox, BorderLayout.SOUTH);
		tester.pack();
		tester.setMinimumSize(tester.getPreferredSize());
		tester.setVisible(true);
	}
	
	public static void main(String[] args) {
		SwingUtilities.invokeLater(new Runnable() {
			@Override
			public void run() {
				new TNoodleServerTest("localhost", 8080);
			}
		});
	}

}
