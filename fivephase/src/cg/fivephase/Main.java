package cg.fivephase;

public final class Main {

	public static void main(String[] args){

		int random_count = 30;
		CubeState c = new CubeState();
		String s;
		for (int i = 0; i < random_count; ++i) {
			//System.out.println( new Search().solve( Tools.randomCube(), 1000, true));
			c = Tools.randomCube();
			s = new Search().solve( c, 500, true);
			System.out.println (s);
		}
	}
}
