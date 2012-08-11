/*
Edge Cubies: 
					14	2	
				1			15
				13			3
					0	12	
	1	13			0	12			3	15			2	14	
9			20	20			11	11			22	22			9
21			8	8			23	23			10	10			21
	17	5			18	6			19	7			16	4	
					18	6	
				5			19
				17			7
					4	16	

Center Cubies: 
			0	1
			3	2

20	21		8	9		16	17		12	13
23	22		11	10		19	18		15	14

			4	5
			7	6

	 *             |************|
	 *             |*U1**U2**U3*|
	 *             |************|
	 *             |*U4**U5**U6*|
	 *             |************|
	 *             |*U7**U8**U9*|
	 *             |************|
	 * ************|************|************|************|
	 * *L1**L2**L3*|*F1**F2**F3*|*R1**R2**F3*|*B1**B2**B3*|
	 * ************|************|************|************|
	 * *L4**L5**L6*|*F4**F5**F6*|*R4**R5**R6*|*B4**B5**B6*|
	 * ************|************|************|************|
	 * *L7**L8**L9*|*F7**F8**F9*|*R7**R8**R9*|*B7**B8**B9*|
	 * ************|************|************|************|
	 *             |************|
	 *             |*D1**D2**D3*|
	 *             |************|
	 *             |*D4**D5**D6*|
	 *             |************|
	 *             |*D7**D8**D9*|
	 *             |************|
	 */


package cs.threephase;

import java.util.*;
import static cs.threephase.Moves.*;
import static cs.threephase.Util.*;
import static cs.threephase.Center1.symmove;
import static cs.threephase.Center1.symmult;

public class FullCube implements Comparable {
	
	public static class ValueComparator implements Comparator<FullCube> {
		public int compare(FullCube c1, FullCube c2) {
			return c2.value - c1.value;
		}
	}
	
	private EdgeCube edge;
	private CenterCube center;
	private CornerCube corner;
	
	int value = 0;
	boolean add1 = false;
	int length1 = 0;
	int length2 = 0;
	int length3 = 0;

	@Override
	public int compareTo(Object c) {
		if (c instanceof FullCube) {
			return this.value - ((FullCube)c).value;
		} else {
			return 0;
		}
	}
	
	public FullCube() {
		edge = new EdgeCube();
		center = new CenterCube();
		corner = new CornerCube();
	}

	public FullCube(FullCube c) {
		this();
		copy(c);
	}
	
	public FullCube(long seed) {
		Random r = new Random(seed);
		edge = new EdgeCube(r);
		center = new CenterCube(r);
		corner = new CornerCube(r);
	}
	
	public FullCube(int[] moveseq) {
		this();
		for (int m : moveseq) {
			doMove(m);
		}
	}
	
	public void copy(FullCube c) {
		edge.copy(c.edge);
		center.copy(c.center);
		corner.copy(c.corner);
		
		this.value = c.value;
		this.add1 = c.add1;
		this.length1 = c.length1;
		this.length2 = c.length2;
		this.length3 = c.length3;
		
		this.sym = c.sym;
		
		for (int i=0; i<60; i++) {
			this.moveBuffer[i] = c.moveBuffer[i];
		}
		this.moveLength = c.moveLength;
		this.edgeAvail = c.edgeAvail;
		this.centerAvail = c.centerAvail;
		this.cornerAvail = c.cornerAvail;
	}
	
//	public void print() {	
//		getCenter().print();
//		getEdge().print();
//	}

	public boolean checkEdge() {
		return getEdge().checkEdge();
	}

	public String getMoveString(boolean inverse) {
		StringBuffer sb = new StringBuffer();
		int sym = this.sym;
		if (inverse) {
			for (int i=moveLength-1; i>=length1 + (add1 ? 2 : 0); i--) {
				sb.append(moveIstr[symmove[sym][moveBuffer[i]]]).append(' ');
			}
			for (int i=length1-1; i>=0; i--) {
				sb.append(moveIstr[moveBuffer[i]]).append(' ');
			}
		} else {
			for (int i=0; i<length1; i++) {
				sb.append(move2str[moveBuffer[i]]).append(' ');
			}
			for (int i=length1 + (add1 ? 2 : 0); i<moveLength; i++) {
				if (symmove[sym][moveBuffer[i]] >= dx1) {
					sb.append(move2str[symmove[sym][moveBuffer[i]]-9]).append(' ');
					int rot = move2rot[symmove[sym][moveBuffer[i]] - dx1];
					sym = symmult[sym][rot];
				} else {
					sb.append(move2str[symmove[sym][moveBuffer[i]]]).append(' ');
				}
			}
		}
		return sb.toString();
	}
	
	private static int[] move2rot = {35, 1, 34, 2, 4, 6, 22, 5, 19};
	 
	String to333Facelet() {
		char[] ret = new char[54];
		getEdge().fill333Facelet(ret);
		getCenter().fill333Facelet(ret);
		getCorner().fill333Facelet(ret);
		return new String(ret);
	}
	
	byte[] moveBuffer = new byte[60];
	private int moveLength = 0;
	private int edgeAvail = 0;
	private int centerAvail = 0;
	private int cornerAvail = 0;
	
	int sym = 0;

	void move(int m) {
		moveBuffer[moveLength++] = (byte)m;
		return;
	}
	
	void doMove(int m) {
		getEdge().move(m);
		getCenter().move(m);
		getCorner().move(m % 18);	
	}
	
	EdgeCube getEdge() {
		while (edgeAvail < moveLength) {
			edge.move(moveBuffer[edgeAvail++]);
		}
		return edge;
	}
	
	CenterCube getCenter() {
		while (centerAvail < moveLength) {
			center.move(moveBuffer[centerAvail++]);
		}
		return center;
	}
	
	CornerCube getCorner() {
		while (cornerAvail < moveLength) {
			corner.move(moveBuffer[cornerAvail++] % 18);
		}
		return corner;
	}
}
