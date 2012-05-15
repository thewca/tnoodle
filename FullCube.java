package cs.sq12phase;

import java.util.*;

public class FullCube implements Comparable<FullCube> {

	int ul = 0x011233;
	int ur = 0x455677;
	int dl = 0x998bba;
	int dr = 0xddcffe;
	int ml = 0;
	
	public int compareTo(FullCube f) {
		if (ul != f.ul) {
			return ul - f.ul;
		}
		if (ur != f.ur) {
			return ur - f.ur;
		}
		if (dl != f.dl) {
			return dl - f.dl;
		}
		if (dr != f.dr) {
			return dr - f.dr;
		}
		return ml - f.ml;
	}
	
	public static void main(String[] args) {
		TreeSet<FullCube> treeA = new TreeSet<FullCube>();
		TreeSet<FullCube> treeB = new TreeSet<FullCube>();
		FullCube f0 = new FullCube("");
		f0.doMove(1);
		for (int i=0; i<12; i+=3) {
			f0.doMove(3);
			FullCube fx = new FullCube("");
			fx.copy(f0);
			treeA.add(fx);
		}
		while (true) {
			for (FullCube f : treeA) {
				for (int i=0; i<4; i++) {
					f.doMove(3);
					FullCube fx = new FullCube("");
					fx.copy(f);
					treeB.add(fx);
					assert fx.getShapeIdx() == f.getShapeIdx();
				}
				for (int i=0; i<4; i++) {
					f.doMove(-3);
					FullCube fx = new FullCube("");
					fx.copy(f);
					treeB.add(fx);
					assert fx.getShapeIdx() == f.getShapeIdx();
				}
				f.doMove(0);
				FullCube fx = new FullCube("");
				fx.copy(f);
				treeB.add(fx);
				f.doMove(0);
				assert fx.getShapeIdx() == f.getShapeIdx();
			}
			treeA.addAll(treeB);
			treeB.clear();
			System.out.println(treeA.size());
		}
	}

	FullCube(String s) {
		//TODO
	}
	
	static Random gen = new Random();
	
	public static FullCube randomCube() {
		//TODO
			FullCube f = new FullCube("");
			int shape = 2074;
			int m=0;
			for (int i=0; i<1000; i++) {
				switch (m=gen.nextInt(3)) {
					case 0 :
						shape = Shape.TopMove[shape];
						f.doMove(shape & 0x0f);
						shape >>= 4;
						break;
					case 1 :
						shape = Shape.TwistMove[shape];
						f.doMove(0);
						break;
					case 2 :
						shape = Shape.BottomMove[shape];
						f.doMove(-(shape & 0x0f));
						shape >>= 4;
						break;
				}
			}
		return f;
	}

	void copy(FullCube c) {
		this.ul = c.ul;
		this.ur = c.ur;
		this.dl = c.dl;
		this.dr = c.dr;
		this.ml = c.ml;
	}
	
	/**
	 * @param move
	 * 0 = twist
	 * [1, 11] = top move
	 * [-1, -11] = bottom move
	 * for example, 6 == (6, 0), 9 == (-3, 0), -4 == (0, 4)
	 */
	void doMove(int move) {
		move <<= 2;
		if (move > 24) {
			move = 48 - move;
			int temp = ul;
			ul = (ul>>move | ur<<(24-move)) & 0xffffff;
			ur = (ur>>move | temp<<(24-move)) & 0xffffff;
		} else if (move > 0) {
			int temp = ul;
			ul = (ul<<move | ur>>(24-move)) & 0xffffff;
			ur = (ur<<move | temp>>(24-move)) & 0xffffff;		
		} else if (move == 0) {
			int temp = ur;
			ur = dl;
			dl = temp;
			ml = 1-ml;
		} else if (move >= -24) {
			move = -move;
			int temp = dl;
			dl = (dl<<move | dr>>(24-move)) & 0xffffff;
			dr = (dr<<move | temp>>(24-move)) & 0xffffff;				
		} else if (move < -24) {
			move = 48 + move;
			int temp = dl;
			dl = (dl>>move | dr<<(24-move)) & 0xffffff;
			dr = (dr>>move | temp<<(24-move)) & 0xffffff;		
		}
	}
	
	private byte pieceAt(int idx) {
		int ret;
		if (idx < 6) {
			ret = ul >> ((5-idx) << 2);
		} else if (idx < 12) {
			ret = ur >> ((11-idx) << 2);		
		} else if (idx < 18) {
			ret = dl >> ((17-idx) << 2);
		} else {
			ret = dr >> ((23-idx) << 2);
		}
		return (byte) (ret & 0x0f);
	}
	
	int[] arr = new int[16];
	
	int getParity() {
//		int[] arr = new int[16];
		int cnt = 0;
		arr[0] = pieceAt(0);
		for (int i=1; i<24; i++) {
			if (pieceAt(i) != arr[cnt]) {
				arr[++cnt] = pieceAt(i);
			}
		}
		int p = 0;
		for (int a=0; a<16; a++){
			for(int b=a+1 ; b<16 ; b++){
				if (arr[a] > arr[b]) p^=1;
			}
		}
		return p;
	}
	
	int getShapeIdx() {
		int urx = ur & 0x111111;
		urx |= urx >> 3;
		urx |= urx >> 6;
		urx = (urx&0xf) | ((urx>>12)&0x30);
		int ulx = ul & 0x111111;
		ulx |= ulx >> 3;
		ulx |= ulx >> 6;
		ulx = (ulx&0xf) | ((ulx>>12)&0x30);
		int drx = dr & 0x111111;
		drx |= drx >> 3;
		drx |= drx >> 6;
		drx = (drx&0xf) | ((drx>>12)&0x30);
		int dlx = dl & 0x111111;
		dlx |= dlx >> 3;
		dlx |= dlx >> 6;
		dlx = (dlx&0xf) | ((dlx>>12)&0x30);
		return Shape.getShape2Idx(getParity()<<24 | ulx<<18 | urx<<12 | dlx<<6 | drx);
	}
	
	void print() {
		System.out.println(Integer.toHexString(ul));
		System.out.println(Integer.toHexString(ur));
		System.out.println(Integer.toHexString(dl));
		System.out.println(Integer.toHexString(dr));
	}

	byte[] prm = new byte[8];
	
	void getSquare(Square sq) {
		//TODO
//		byte[] prm = new byte[8];
		for (int a=0;a<8;a++) {
			prm[a] = (byte) (pieceAt(a*3+1)>>1);
		}
		//convert to number
		sq.cornperm = Square.get8Perm(prm);
		
		int a, b;
		//Strip top layer edges
		sq.topEdgeFirst = pieceAt(0)==pieceAt(1);
		a = sq.topEdgeFirst ? 2 : 0;
		for(b=0; b<4; a+=3, b++) prm[b]=(byte)(pieceAt(a)>>1);
		
		sq.botEdgeFirst = pieceAt(12)==pieceAt(13);
		a = sq.botEdgeFirst ? 14 : 12;

//		if(pieceAt(12)==pieceAt(13)){ a=14; sq.botEdgeFirst=false; }
//		else{ a=12; sq.botEdgeFirst=true;  }
		for( ; b<8; a+=3, b++) prm[b]=(byte)(pieceAt(a)>>1);
		sq.edgeperm=Square.get8Perm(prm);


		sq.ml = ml;
	}
}
