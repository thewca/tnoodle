package net.gnehzr.tnoodle.svglite;

public class Ellipse extends Element {

    public Ellipse(double cx, double cy, double rx, double ry) {
        super("ellipse");
        setAttribute("cx", "" + cx);
        setAttribute("cy", "" + cy);
        setAttribute("rx", "" + rx);
        setAttribute("ry", "" + ry);
    }

    public Ellipse(Ellipse e) {
        super(e);
    }

}
