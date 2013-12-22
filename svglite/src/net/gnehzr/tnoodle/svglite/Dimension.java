package net.gnehzr.tnoodle.svglite;

public class Dimension {

    public int width, height;
    public Dimension(int width, int height) {
        this.width = width;
        this.height = height;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public String toString() {
        return "<" + Dimension.class.getName() +
               " width=" + width +
               " height=" + height +
               ">";
    }

}
