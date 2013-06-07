package java.awt;

import java.awt.geom.AffineTransform;

public abstract class Graphics2D {

    // Modified so we don't have to copy around the RenderingHints.Key
    // class.
    public void setRenderingHint(int hintKey, int hintValue) { }

    public void translate(double tx, double ty) {
    }

    public void setColor(Color c) {}

    public void drawOval(int x,
            int y,
            int width,
            int height) {}
    public void fillOval(int x,
            int y,
            int width,
            int height) {}


    public void drawRect(int x,
            int y,
            int width,
            int height) {}
    public void fillRect(int x,
            int y,
            int width,
            int height) {}


    public void draw(Shape s) {}

    public void setTransform(AffineTransform Tx) {}
    public AffineTransform getTransform() {
        return null;
    }

    public void rotate(double theta) {}
    public void rotate(double theta,
            double x,
            double y) {}


    public void fill(Shape s) {}

    public void scale(double sx, double sy) {}

    public FontMetrics getFontMetrics() {
        return null;
    }


    public void drawString(String str,
            float x,
            float y) {}


    public void setStroke(Stroke s) {}

}
