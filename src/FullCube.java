package cs.threephase;

import java.util.*;
import static cs.threephase.Moves.*;
import static cs.threephase.Util.*;

public class FullCube implements Comparable {
//TODO: split to CenterCube, EdgeCube, CornerCube.

//	int[] ep = new int[24];
//	int[] ct = new int[24];
	int cparity = 0;
	int eparity = 0;
	
	EdgeCube edge;
	CenterCube center;
	
	int value = 0;
	boolean add1 = false;
	int length1 = 0;
	int length2 = 0;
	int length3 = 0;
	
	int[] moveseq1 = new int[20];
	int[] moveseq2 = new int[20];
	int[] moveseq3 = new int[20];
	


	@Override
	public int compareTo(Object c) {
		if (c instanceof FullCube) {
			return this.value - ((FullCube)c).value;
		} else {
			return 0;
		}
	}
	
	private static final int[] cpmv = {1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 
										1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1};
	private static final int[] epmv = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
										1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1};
	
	public FullCube() {
		edge = new EdgeCube();
		center = new CenterCube();
	}

	public FullCube(FullCube c) {
		this();
		copy(c);
	}
	
	public FullCube(long seed) {
		Random r = new Random(seed);
		edge = new EdgeCube(r);
		center = new CenterCube(r);
		eparity = edge.getParity();
		
//TODO	cparity = r.nextInt(2);
	}
	
	public FullCube(int[] moveseq) {
		this();
		for (int m : moveseq) {
			move(m);
		}
	}
	
	public void copy(FullCube c) {
		edge.copy(c.edge);
		center.copy(c.center);
		this.cparity = c.cparity;
		this.eparity = c.eparity;
		
		this.add1 = c.add1;
		this.length1 = c.length1;
		this.length2 = c.length2;
		this.length3 = c.length3;
		for (int i=0; i<20; i++) {
			this.moveseq1[i] = c.moveseq1[i];
			this.moveseq2[i] = c.moveseq2[i];
			this.moveseq3[i] = c.moveseq3[i];
		}
	}
	
	public void print() {	
		center.print();
		edge.print();
	}

	public boolean checkEdge() {
		return edge.checkEdge();
	}

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
	 
	String to333Facelet(CornerCube c) {
		char[] ret = new char[54];
		edge.fill333Facelet(ret);
		center.fill333Facelet(ret);
		c.fill333Facelet(ret);
		return new String(ret);
	}
	
	void move(int m) {
		cparity ^= cpmv[m];
		eparity ^= epmv[m];
		edge.move(m);
		center.move(m);
	}
}
