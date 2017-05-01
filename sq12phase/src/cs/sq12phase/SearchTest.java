package cs.sq12phase;

public class SearchTest {

    static void scramble(FullCube f, int moves, java.util.Random gen) {
        int shape = f.getShapeIdx();
        int m = 0;
        for (int i = 0; i < moves; i++) {
            int r = gen.nextInt(3);
            if (r == 0) {
                shape = Shape.TwistMove[shape];
                f.doMove(0);
                m = 0;
            } else if (r == 1) {
                m = Shape.TopMove[shape];
                shape = m >> 4;
                m &= 0xf;
                f.doMove(m);
            } else if (r == 2) {
                m = Shape.BottomMove[shape];
                shape = m >> 4;
                m &= 0xf;
                m = -m;
                f.doMove(m);
            }
            assert shape == f.getShapeIdx();
            // System.out.println(m);
            // System.out.println("\t\t" + Shape.ShapePrunOpt[shape]);
        }
    }

    public static void main(String[] args) {
        long t = System.nanoTime();

        new Search().solution(new FullCube(""));
        System.out.println((System.nanoTime() - t) / 1e9 + " seconds to initialize");

        t = System.nanoTime();
        Search s = new Search();
        java.util.Random gen = new java.util.Random(4L);
        FullCube f;
        long tt = System.nanoTime();
        int MAXL = 15;
        for (int i = 0; i < 1000; i++) {
            f = new FullCube();
            scramble(f, 15, gen);
            String str = s.solutionOpt(f, MAXL);
            // System.out.print(s.length1 + " ");
            System.out.print(String.format("AvgTime: %6.3f ms\r", (System.nanoTime() - t) / 1e6 / (i + 1)));
        }
        System.out.println();
        for (int x = 0; x < 1000; x++) {
            s.solution(FullCube.randomCube());
            System.out.print(String.format("AvgTime: %6.3f ms\r", (System.nanoTime() - t) / 1e6 / (x + 1)));
        }
        System.out.println();
    }
}
