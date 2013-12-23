package net.gnehzr.tnoodle.svglite;

public class Svg extends Element {
    
    private double originOffsetX, originOffsetY;
    public Svg(Dimension size) {
        super("svg");
        setSize(size);
        setAttribute("version", "1.1");
        setAttribute("xmlns", "http://www.w3.org/2000/svg");
        originOffsetX = 0;
        originOffsetY = 0;
    }

    public void setSize(Dimension size) {
        setAttribute("width", "" + size.width + "px");
        setAttribute("height", "" + size.height + "px");
        setAttribute("viewBox", "0 0 " + size.width + " " + size.height);
    }

    public Dimension getSize() {
        int width = Integer.parseInt(getAttribute("width").replace("px", ""));
        int height = Integer.parseInt(getAttribute("height").replace("px", ""));
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
            p.setStrokeColor(null);
            p.setFillColor(c);
        }
        String transform = getAttribute("transform");
        if(transform != null) {
            p.setAttribute("transform", transform);
        }
        appendChild(p);
    }

    public void draw(Element p) {
        p = (Element) p.clone();
        if(c != null) {
            p.setStrokeColor(c);
            p.setFillColor(null);
        }
        String transform = getAttribute("transform");
        if(transform != null) {
            p.setAttribute("transform", transform);
        }
        appendChild(p);
    }

    private Ellipse toOval(double x, double y, double width, double height) {
        double rx = width/2.0;
        double ry = height/2.0;
        double cx = x + rx;
        double cy = y + ry;
        Ellipse oval = new Ellipse(cx, cy, rx, ry);
        return oval;
    }

    public void drawOval(double x, double y, double width, double height) {
        Ellipse oval = toOval(x, y, width, height);
        draw(oval);
    }

    public void fillOval(double x, double y, double width, double height) {
        Ellipse oval = toOval(x, y, width, height);
        fill(oval);
    }

    public void rotate(double a) {
        super.rotate(a, originOffsetX, originOffsetY);
    }
    public void translate(double x, double y) {
        originOffsetX += x;
        originOffsetY += y;
        super.translate(x, y);
    }

}
