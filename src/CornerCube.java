package cs.threephase;

import java.util.Random;

class CornerCube {

	/**
	 * 18 move cubes
	 */
	static CornerCube[] moveCube = new CornerCube[18];
	

	byte[] cp = {0, 1, 2, 3, 4, 5, 6, 7};
	byte[] co = {0, 0, 0, 0, 0, 0, 0, 0};
	
	CornerCube temps = null;//new CornerCube();

	CornerCube() {
	}

	CornerCube(int cperm, int twist) {
		this.setCPerm(cperm);
		this.setTwist(twist);
	}

	CornerCube(CornerCube c) {
		copy(c);
	}

	void copy(CornerCube c) {
		for (int i = 0; i < 8; i++) {
			this.cp[i] = c.cp[i];
			this.co[i] = c.co[i];
		}
	}
	
	/**
	 * prod = a * b, Corner Only.
	 */
	static void CornMult(CornerCube a, CornerCube b, CornerCube prod) {
		for (int corn=0; corn<8; corn++) {
			prod.cp[corn] = a.cp[b.cp[corn]];
			byte oriA = a.co[b.cp[corn]];
			byte oriB = b.co[corn];
			byte ori = oriA;
			ori += (oriA<3) ? oriB : 6-oriB;
			ori %= 3;
			if ((oriA >= 3) ^ (oriB >= 3)) {
				ori += 3;
			}
			prod.co[corn] = ori;
		}
	}

	void setTwist(int idx) {
		int twst = 0;
		for (int i=6; i>=0; i--) {
			twst += co[i] = (byte) (idx % 3);
			idx /= 3;
		}
		co[7] = (byte) ((15 - twst) % 3);
	}
	
	void setCPerm(int idx) {
		Util.set8Perm(cp, idx);
	}
	
	void doMove(int idx) {
		if (temps == null) {
			temps = new CornerCube();
		}
		CornMult(this, moveCube[idx], temps);
		copy(temps);
	}

	static {
		initMove();
	}

	static void initMove() {
		moveCube[0] = new CornerCube(15120, 0);
		moveCube[3] = new CornerCube(21021, 1494);
		moveCube[6] = new CornerCube(8064, 1236);
		moveCube[9] = new CornerCube(9, 0);
		moveCube[12] = new CornerCube(1230, 412);
		moveCube[15] = new CornerCube(224, 137);
		for (int a=0; a<18; a+=3) {
			for (int p=0; p<2; p++) {
				moveCube[a+p+1] = new CornerCube();
				CornMult(moveCube[a+p], moveCube[a], moveCube[a+p+1]);
			}
		}
	}
}
