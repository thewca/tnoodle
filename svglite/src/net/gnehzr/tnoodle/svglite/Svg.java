package net.gnehzr.tnoodle.svglite;

public class Svg extends Element {
    
    public Svg(Dimension size) {
        super("svg");
        setSize(size);
        setAttribute("version", "1.1");
        setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }

    public void setSize(Dimension size) {
        setAttribute("width", "" + size.width);
        setAttribute("height", "" + size.height);
    }

    public Dimension getSize() {
        int width = Integer.parseInt(getAttribute("width"));
        int height = Integer.parseInt(getAttribute("height"));
        return new Dimension(width, height);
    }

    // TODO - emulating the old graphics2d way of doing things doesn't
    // seem ideal, i think we should consider doing the following:
    //  - get rid of setColor?
    //  - combine draw and fill?

    private Color c = null;
    public void setColor(Color c) {
        this.c = c;
    }

    public void setStroke(int strokeWidth, int miterLimit, String lineJoin) {
        setStyle("stroke-width", strokeWidth + "px");
        setStyle("stroke-miterlimit", "" + miterLimit);
        setStyle("stroke-linejoin", lineJoin);
    }

    public void fill(Element p) {
        p = (Element) p.clone();
        if(c != null) {
            p.setStrokeColor(c);
            p.setFillColor(c);
        }
        appendChild(p);
    }

    public void draw(Element p) {
        p = (Element) p.clone();
        if(c != null) {
            p.setStrokeColor(c);
            p.setFillColor(null);
        }
        appendChild(p);
    }

    public void drawOval(double cx, double cy, double rx, double ry) {
        Ellipse oval = new Ellipse(cx, cy, rx, ry);
        draw(oval);
    }

    public void fillOval(double cx, double cy, double rx, double ry) {
        Ellipse oval = new Ellipse(cx, cy, rx, ry);
        fill(oval);
    }

}
