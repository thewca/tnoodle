package net.gnehzr.tnoodle.svglite;

public class Text extends Element {

    public Text(String text, double x, double y) {
        super("text");
        setContent(text);
        setAttribute("x", "" + x);
        setAttribute("y", "" + y);
    }

}
