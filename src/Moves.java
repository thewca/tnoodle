package cs.threephase;
import java.util.*;

class Moves {
	public static final int Ux1 = 0;
	public static final int Ux2 = 1;
	public static final int Ux3 = 2;
	public static final int Rx1 = 3;
	public static final int Rx2 = 4;
	public static final int Rx3 = 5;
	public static final int Fx1 = 6;
	public static final int Fx2 = 7;
	public static final int Fx3 = 8;
	public static final int Dx1 = 9;
	public static final int Dx2 = 10;
	public static final int Dx3 = 11;
	public static final int Lx1 = 12;
	public static final int Lx2 = 13;
	public static final int Lx3 = 14;
	public static final int Bx1 = 15;
	public static final int Bx2 = 16;
	public static final int Bx3 = 17;
	public static final int ux1 = 18;
	public static final int ux2 = 19;
	public static final int ux3 = 20;
	public static final int rx1 = 21;
	public static final int rx2 = 22;
	public static final int rx3 = 23;
	public static final int fx1 = 24;
	public static final int fx2 = 25;
	public static final int fx3 = 26;
	public static final int dx1 = 27;
	public static final int dx2 = 28;
	public static final int dx3 = 29;
	public static final int lx1 = 30;
	public static final int lx2 = 31;
	public static final int lx3 = 32;
	public static final int bx1 = 33;
	public static final int bx2 = 34;
	public static final int bx3 = 35;
	public static final int eom = 36;//End Of Moves
	
	public static final String[] move2str = {"U  ", "U2 ", "U' ", "R  ", "R2 ", "R' ", "F  ", "F2 ", "F' ", 
											 "D  ", "D2 ", "D' ", "L  ", "L2 ", "L' ", "B  ", "B2 ", "B' ", 
											 "Uw ", "Uw2", "Uw'", "Rw ", "Rw2", "Rw'", "Fw ", "Fw2", "Fw'", 
											 "Dw ", "Dw2", "Dw'", "Lw ", "Lw2", "Lw'", "Bw ", "Bw2", "Bw'"};
	
	public static final String[] moveIstr = {"U' ", "U2 ", "U  ", "R' ", "R2 ", "R  ", "F' ", "F2 ", "F  ", 
											 "D' ", "D2 ", "D  ", "L' ", "L2 ", "L  ", "B' ", "B2 ", "B  ", 
											 "Uw'", "Uw2", "Uw ", "Rw'", "Rw2", "Rw ", "Fw'", "Fw2", "Fw ", 
											 "Dw'", "Dw2", "Dw ", "Lw'", "Lw2", "Lw ", "Bw'", "Bw2", "Bw "};
	
	static int[] move2std = {Ux1, Ux2, Ux3, Rx1, Rx2, Rx3, Fx1, Fx2, Fx3, 
							 Dx1, Dx2, Dx3, Lx1, Lx2, Lx3, Bx1, Bx2, Bx3, 
							 ux2, rx1, rx2, rx3, fx2, dx2, lx1, lx2, lx3, bx2, eom};
	
	static int[] move3std = {Ux1, Ux2, Ux3, Rx2, Fx1, Fx2, Fx3, Dx1, Dx2, Dx3, Lx2, Bx1, Bx2, Bx3, 
							 ux2, rx2, fx2, dx2, lx2, bx2, eom};
	
	static int[] std2move = new int[37];
	static int[] std3move = new int[37];
		
	static boolean[][] ckmv = new boolean[37][36];
	static boolean[][] ckmv2 = new boolean[29][28];
	static boolean[][] ckmv3 = new boolean[21][20];
	
	static int[] skipAxis = new int[36];
	static int[] skipAxis2 = new int[28];
	static int[] skipAxis3 = new int[20];
	
	static {
		for (int i=0; i<29; i++) {
			std2move[move2std[i]] = i;
		}
		for (int i=0; i<21; i++) {
			std3move[move3std[i]] = i;
		}
		for (int i=0; i<36; i++) {
			for (int j=0; j<36; j++) {
				ckmv[i][j] = (i/3 == j/3) || ((i/3%3 == j/3%3) && (i>j));
			}
			ckmv[36][i] = false;
		}
		for (int i=0; i<29; i++) {
			for (int j=0; j<28; j++) {
				ckmv2[i][j] = ckmv[move2std[i]][move2std[j]];
			}
		}
		for (int i=0; i<21; i++) {
			for (int j=0; j<20; j++) {
				ckmv3[i][j] = ckmv[move3std[i]][move3std[j]];
			}
		}
		for (int i=0; i<36; i++) {
			skipAxis[i] = 36;
			for (int j=i; j<36; j++) {
				if (!ckmv[i][j]) {
					skipAxis[i] = j - 1;
					break;
				}
			}
		}
		for (int i=0; i<28; i++) {
			skipAxis2[i] = 28;
			for (int j=i; j<28; j++) {
				if (!ckmv2[i][j]) {
					skipAxis2[i] = j - 1;
					break;
				}
			}
		}
		for (int i=0; i<20; i++) {
			skipAxis3[i] = 20;
			for (int j=i; j<20; j++) {
				if (!ckmv3[i][j]) {
					skipAxis3[i] = j - 1;
					break;
				}
			}
		}
	}
}
