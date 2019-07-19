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

}
