package cs.threephase;

import java.util.Random;

class CornerCube {

	/**
	 * 18 move cubes
	 */
	static CornerCube[] moveCube = new CornerCube[18];
	

	byte[] cp = {0, 1, 2, 3, 4, 5, 6, 7};
	byte[] co = {0, 0, 0, 0, 0, 0, 0, 0};
	byte[] ep = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11};
	byte[] eo = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
	CornerCube temps = null;//new CornerCube();

	CornerCube() {
	}

	CornerCube(int cperm, int twist, int eperm, int flip) {
		this.setCPerm(cperm);
		this.setTwist(twist);
		Util.setNPerm(ep, eperm, 12);
		this.setFlip(flip);
	}

	CornerCube(CornerCube c) {
		copy(c);
	}

	void copy(CornerCube c) {
		for (int i = 0; i < 8; i++) {
			this.cp[i] = c.cp[i];
			this.co[i] = c.co[i];
		}
		for (int i = 0; i < 12; i++) {
			this.ep[i] = c.ep[i];
			this.eo[i] = c.eo[i];
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

	/**
	 * prod = a * b, Edge Only.
	 */
	static void EdgeMult(CornerCube a, CornerCube b, CornerCube prod) {
		for (int ed=0; ed<12; ed++) {
			prod.ep[ed] = a.ep[b.ep[ed]];
			prod.eo[ed] = (byte) (b.eo[ed] ^ a.eo[b.ep[ed]]);
		}
	}

	void setFlip(int idx) {
		int parity = 0;
		for (int i=10; i>=0; i--) {
			parity ^= eo[i] = (byte) (idx & 1);
			idx >>= 1;
		}
		eo[11] = (byte)parity;
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
	
	void setEPerm(int idx) {
		Util.set8Perm(ep, idx);
	}
	
	CornerCube temp = null;
	
	void doMove(int idx) {
		if (temp == null) {
			temp = new CornerCube();
		}
		CornMult(this, moveCube[idx], temp);
		copy(temp);
	}

	static {
		initMove();
	}

	// ********************************************* Initialization functions *********************************************

	static void initMove() {
		moveCube[0] = new CornerCube(15120, 0, 119750400, 0);
		moveCube[3] = new CornerCube(21021, 1494, 323403417, 0);
		moveCube[6] = new CornerCube(8064, 1236, 29441808, 550);
		moveCube[9] = new CornerCube(9, 0, 5880, 0);
		moveCube[12] = new CornerCube(1230, 412, 2949660, 0);
		moveCube[15] = new CornerCube(224, 137, 328552, 137);
		for (int a=0; a<18; a+=3) {
			for (int p=0; p<2; p++) {
				moveCube[a+p+1] = new CornerCube();
				EdgeMult(moveCube[a+p], moveCube[a], moveCube[a+p+1]);
				CornMult(moveCube[a+p], moveCube[a], moveCube[a+p+1]);
			}
		}
	}
}
