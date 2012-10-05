package cs.sq12phase;


public class Search {
	
	int[] move = new int[100];
	FullCube c = null;
	FullCube d = new FullCube("");
	int length1;
	int maxlen2;
	String sol_string;

	static int getNParity(int idx, int n) {
		int p = 0;
		for (int i=n-2; i>=0; i--) {
			p ^= idx % (n-i);
			idx /= (n-i);
		}
		return p & 1;
	}

	static {
		Shape.init();
		Square.init();
	}
	
	public static void main(String[] args) {
		long t = System.nanoTime();
		
//		FullCube f;// = new FullCube("");
//		System.out.println(f.getParity());
//		System.out.println(f.getShapeIdx());
//		System.out.println(Shape.ShapePrun[f.getShapeIdx()]);
//		int a = Square.SquarePrun[0];
//		Random gen = new Random(1000L);
		new Search().solution(new FullCube(""));
		System.out.println((System.nanoTime()-t)/1e9 + " seconds to initialize");


		t = System.nanoTime();
		for (int x=0; x<1000; x++) {
		
	//		System.out.println(m);
	//		System.out.println(Integer.toBinaryString(Shape.ShapeIdx[shape>>1]));
	//		System.out.println(Integer.toBinaryString(Shape.ShapeIdx[f.getShapeIdx()>>1]));
//			assert f.getShapeIdx() == shape;
//			f.print();
			Search s = new Search();
//			s.solution(FullCube.randomCube());
			System.out.println(s.solution(FullCube.randomCube()));
			System.out.println((System.nanoTime()-t)/1e9/(x+1));
//			t = System.nanoTime();
		}

	}
	
	public String solution(FullCube c) {
		this.c = c;
		sol_string = null;
		int shape = c.getShapeIdx();
		for (length1=Shape.ShapePrun[shape]; length1<100; length1++) {
			maxlen2 = Math.min(31 - length1, 17);
			if (phase1(shape, Shape.ShapePrun[shape], length1, 0, -1)) {
				break;
			}
		}
		return sol_string;
	}
	
	boolean phase1(int shape, int prunvalue, int maxl, int depth, int lm) {

		if (prunvalue==0 && maxl<4) {
			return maxl==0 && init2();
		}
		
		//try each possible move. First twist;
		if (lm != 0) {
			int shapex = Shape.TwistMove[shape];
			int prunx = Shape.ShapePrun[shapex];
			if (prunx < maxl) {
				move[depth] = 0;
				if (phase1(shapex, prunx, maxl-1, depth+1, 0)) {
					return true;
				}				
			}
		}

		//Try top layer
		int shapex = shape;
		if(lm <= 0){
			int m = 0;
			while (true) {
				m += Shape.TopMove[shapex];
				shapex = m >> 4;
				m &= 0x0f;
				if (m >= 12) {
					break;
				}
				int prunx = Shape.ShapePrun[shapex];
				if (prunx > maxl) {
					break;
				} else if (prunx < maxl) {
					move[depth] = m;
					if (phase1(shapex, prunx, maxl-1, depth+1, 1)) {
						return true;
					}
				}
			}
		}
		
		shapex = shape;
		//Try bottom layer
		if(lm <= 1){
			int m = 0;
			while (true) {
				m += Shape.BottomMove[shapex];
				shapex = m >> 4;
				m &= 0x0f;
				if (m >= 6) {
					break;
				}
				int prunx = Shape.ShapePrun[shapex];
				if (prunx > maxl) {
					break;
				} else if (prunx < maxl) {
					move[depth] = -m;
					if (phase1(shapex, prunx, maxl-1, depth+1, 2)) {
						return true;
					}
				}
			}
		}

		return false;
	}
	
	int count = 0;
	Square sq = new Square();
	
	
	boolean init2() {
//		System.out.print(count++);
//		System.out.print('\r');
		d.copy(c);
		for (int i=0; i<length1; i++) {
			d.doMove(move[i]);
		}
		assert Shape.ShapePrun[d.getShapeIdx()] == 0;
//		if(1==1)return false;
//		Square sq = new Square();
		d.getSquare(sq);
		//TODO

		int edge = sq.edgeperm;
		int corner = sq.cornperm;
		int ml = sq.ml;
//		int shp = sq.topEdgeFirst ? 0 : 1;
//		shp |= sq.botEdgeFirst ? 0 : 2;
		
		int prun = Math.max(Square.SquarePrun[sq.edgeperm<<1|ml], Square.SquarePrun[sq.cornperm<<1|ml]);

		for (int i=prun; i<maxlen2; i++) {
//			System.out.println(i);
			if (phase2(edge, corner, sq.topEdgeFirst, sq.botEdgeFirst, ml, i, length1, 0)) {

				sol_string = move2string(i + length1);

//Unnecessary Code. Just for checking whether the solution is correct.
//				for (int j=0; j<i; j++) {
//					d.doMove(move[length1+j]);
//					System.out.println(pruncomb[length1+j]);
//				}
//				System.out.println();
//				System.out.println(d.getShapeIdx());
//				System.out.println(Integer.toHexString(d.ul));
//				System.out.println(Integer.toHexString(d.ur));
//				System.out.println(Integer.toHexString(d.dl));
//				System.out.println(Integer.toHexString(d.dr));
				sol_string = move2string(i + length1);
				return true;
			}
		}

		return false;
	}
	
	int pruncomb[] = new int[100];
	
	String move2string(int len) {
		//TODO whether to invert the solution or not should be set by params.
		StringBuffer s = new StringBuffer();
		int top = 0, bottom = 0;
		for (int i=len-1; i>=0; i--) {
				int val = move[i];
				if (val > 0) {
					val = 12 - val;
					top = (val > 6) ? (val-12) : val;
				} else if (val < 0) {
					val = 12 + val;
					bottom = (val > 6) ? (val-12) : val;
				} else {
					if (top == 0 && bottom == 0) {
						s.append(" / ");
					} else {
						s.append('(').append(top).append(",").append(bottom).append(") / ");
					}
					top = bottom = 0;
				}
		}
		if (top == 0 && bottom == 0) {
		} else {
			s.append('(').append(top).append(",").append(bottom).append(")");
		}
		return s.toString();// + " (" + len + "t)";
	}

	boolean phase2(int edge, int corner, boolean topEdgeFirst, boolean botEdgeFirst, int ml, int maxl, int depth, int lm) {
		if (maxl == 0 && !topEdgeFirst && botEdgeFirst/*edge==0 && corner==0 && !topEdgeFirst && botEdgeFirst && ml==0*/) {
			assert edge==0 && corner==0 && ml==0;
			return true;
		}
		
		//try each possible move. First twist;
		if(lm!=0 && topEdgeFirst == botEdgeFirst) {
			int edgex = Square.TwistMove[edge];
			int cornerx = Square.TwistMove[corner];

			if (Square.SquarePrun[edgex<<1|(1-ml)] < maxl && Square.SquarePrun[cornerx<<1|(1-ml)] < maxl) {
				move[depth] = 0;
				if (phase2(edgex, cornerx, topEdgeFirst, botEdgeFirst, 1-ml, maxl-1, depth+1, 0)) {
					return true;
				}
			}
		}

		//Try top layer
		if (lm <= 0){
			boolean topEdgeFirstx = !topEdgeFirst;
			int edgex = topEdgeFirstx ? Square.TopMove[edge] : edge;
			int cornerx = topEdgeFirstx ? corner : Square.TopMove[corner];
			int m = topEdgeFirstx ? 1 : 2;
			int prun1 = Square.SquarePrun[edgex<<1|ml];
			int prun2 = Square.SquarePrun[cornerx<<1|ml];
			while (m < 12 && prun1 <= maxl && prun1 <= maxl) {
				if (prun1 < maxl && prun2 < maxl) {
					move[depth] = m;
					if (phase2(edgex, cornerx, topEdgeFirstx, botEdgeFirst, ml, maxl-1, depth+1, 1)) {
						return true;
					}
				}
				topEdgeFirstx = !topEdgeFirstx;
				if (topEdgeFirstx) {
					edgex = Square.TopMove[edgex];
					prun1 = Square.SquarePrun[edgex<<1|ml];
					m += 1;
				} else {
					cornerx = Square.TopMove[cornerx];
					prun2 = Square.SquarePrun[cornerx<<1|ml];
					m += 2;
				}
			}
		}

		if (lm <= 1){
			boolean botEdgeFirstx = !botEdgeFirst;
			int edgex = botEdgeFirstx ? Square.BottomMove[edge] : edge;
			int cornerx = botEdgeFirstx ? corner : Square.BottomMove[corner];
			int m = botEdgeFirstx ? 1 : 2;
			int prun1 = Square.SquarePrun[edgex<<1|ml];
			int prun2 = Square.SquarePrun[cornerx<<1|ml];
			while (m < (maxl > 6 ? 6 : 12) && prun1 <= maxl && prun1 <= maxl) {
				if (prun1 < maxl && prun2 < maxl) {
					move[depth] = -m;
					if (phase2(edgex, cornerx, topEdgeFirst, botEdgeFirstx, ml, maxl-1, depth+1, 2)) {
						return true;
					}
				}
				botEdgeFirstx = !botEdgeFirstx;
				if (botEdgeFirstx) {
					edgex = Square.BottomMove[edgex];
					prun1 = Square.SquarePrun[edgex<<1|ml];
					m += 1;
				} else {
					cornerx = Square.BottomMove[cornerx];
					prun2 = Square.SquarePrun[cornerx<<1|ml];
					m += 2;
				}
			}
		}
		return false;
	}
}
