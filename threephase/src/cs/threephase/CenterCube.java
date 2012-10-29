package cs.threephase;

import static cs.threephase.Util.swap;

import java.util.Random;

class CenterCube {

	byte[] ct = new byte[24];

	CenterCube() {
		for (int i=0; i<24; i++) {
			ct[i] = (byte) (i / 4);
		}
	}

	CenterCube(CenterCube c) {
		copy(c);
	}
	
	CenterCube(Random r) {
		this();
		for (int i=0; i<23; i++) {
			int t = i + r.nextInt(24-i);
			if (ct[t] != ct[i]) {
				byte m = ct[i];
				ct[i] = ct[t];
				ct[t] = m;
			}
		}
	}
	
	CenterCube(int[] moveseq) {
		this();
		for (int m=0; m<moveseq.length; m++) {
			move(m);
		}
	}
	
	void copy(CenterCube c) {
		for (int i=0; i<24; i++) {
			this.ct[i] = c.ct[i];
		}
	}
	
	void print() {
		for (int i=0; i<24; i++) {
			System.out.print(ct[i]);
			System.out.print('\t');
		}
		System.out.println();
	}
	
	static int[] center333Map = {0, 4, 2, 1, 5, 3};
	
	void fill333Facelet(char[] facelet) {
		int firstIdx = 4, inc = 9;
		for (int i=0; i<6; i++) {
			int idx = center333Map[i] << 2;
			if (ct[idx] != ct[idx+1] || ct[idx+1] != ct[idx+2] || ct[idx+2] != ct[idx+3]) {
				throw new RuntimeException("Unsolved Center");
			}
			facelet[firstIdx + i * inc] = Util.colorMap4to3[ct[idx]];
		}
	}

	void move(int m) {
		int key = m % 3;
		m /= 3;
		switch (m) {
		case 0:	//U
			swap(ct, 0, 1, 2, 3, key);
			break;
		case 1:	//R
			swap(ct, 16, 17, 18, 19, key);
			break;
		case 2:	//F
			swap(ct, 8, 9, 10, 11, key);
			break;
		case 3:	//D
			swap(ct, 4, 5, 6, 7, key);
			break;
		case 4:	//L
			swap(ct, 20, 21, 22, 23, key);
			break;
		case 5:	//B
			swap(ct, 12, 13, 14, 15, key);
			break;
		case 6:	//u
			swap(ct, 0, 1, 2, 3, key);
			swap(ct, 8, 20, 12, 16, key);
			swap(ct, 9, 21, 13, 17, key);
			break;
		case 7:	//r
			swap(ct, 16, 17, 18, 19, key);
			swap(ct, 1, 15, 5, 9, key);
			swap(ct, 2, 12, 6, 10, key);
			break;
		case 8:	//f
			swap(ct, 8, 9, 10, 11, key);
			swap(ct, 2, 19, 4, 21, key);
			swap(ct, 3, 16, 5, 22, key);
			break;
		case 9:	//d
			swap(ct, 4, 5, 6, 7, key);
			swap(ct, 10, 18, 14, 22, key);
			swap(ct, 11, 19, 15, 23, key);
			break;
		case 10://l
			swap(ct, 20, 21, 22, 23, key);
			swap(ct, 0, 8, 4, 14, key);
			swap(ct, 3, 11, 7, 13, key);
			break;
		case 11://b
			swap(ct, 12, 13, 14, 15, key);
			swap(ct, 1, 20, 7, 18, key);
			swap(ct, 0, 23, 6, 17, key);
			break;		
		}
	}
}
