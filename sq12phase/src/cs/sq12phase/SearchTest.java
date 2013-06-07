package cs.sq12phase;

public class SearchTest {
    public static void main(String[] args) {
        long t = System.nanoTime();

//      FullCube f;// = new FullCube("");
//      System.out.println(f.getParity());
//      System.out.println(f.getShapeIdx());
//      System.out.println(Shape.ShapePrun[f.getShapeIdx()]);
//      int a = Square.SquarePrun[0];
//      Random gen = new Random(1000L);
        new Search().solution(new FullCube(""));
        System.out.println((System.nanoTime()-t)/1e9 + " seconds to initialize");


        t = System.nanoTime();
        for (int x=0; x<1000; x++) {

    //      System.out.println(m);
    //      System.out.println(Integer.toBinaryString(Shape.ShapeIdx[shape>>1]));
    //      System.out.println(Integer.toBinaryString(Shape.ShapeIdx[f.getShapeIdx()>>1]));
//          assert f.getShapeIdx() == shape;
//          f.print();
            Search s = new Search();
//          s.solution(FullCube.randomCube());
            System.out.println(s.solution(FullCube.randomCube()));
            System.out.println((System.nanoTime()-t)/1e9/(x+1));
//          t = System.nanoTime();
        }

    }
}
