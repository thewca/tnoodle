package net.gnehzr.tnoodle.svglite;

public class Circle extends Ellipse {
    
    public Circle(double cx, double cy, double r) {
        super(cx, cy, r, r);
    }

    public Circle(Circle c) {
        super(c);
    }

}
