package net.gnehzr.tnoodle.svglite;

public class Rectangle extends Element {

    public Rectangle(double x, double y, double width, double height) {
        super("rect");
        setAttribute("x", "" + x);
        setAttribute("y", "" + y);
        setAttribute("width", "" + width);
        setAttribute("height", "" + height);
    }

    public Rectangle(Rectangle r) {
        super(r);
    }

}
