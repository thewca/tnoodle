package java.awt;

import com.levigo.util.gwtawt.client.WebGraphics;
import java.awt.geom.Ellipse2D;

public class Graphics2D {

    private WebGraphics g;
    private FontMetrics fm;
    public Graphics2D(WebGraphics g) {
        this.g = g;
        fm = new FontMetrics(g.getContext2d());
    }

    // Modified so we don't have to copy around the RenderingHints.Key
    // class.
    public void setRenderingHint(int hintKey, int hintValue) { }

    public void translate(double tx, double ty) {
        g.translate((int) tx, (int) ty);
    }

    public void setColor(Color c) {
        g.setColor(c);
        g.setFillColor(c);
    }

    public void drawOval(int x,
            int y,
            int width,
            int height) {
        draw(new Ellipse2D.Float(x, y, width, height));
    }
    public void fillOval(int x,
            int y,
            int width,
            int height) {
        fill(new Ellipse2D.Float(x, y, width, height));
    }

    public void drawRect(int x,
            int y,
            int width,
            int height) {
        draw(new Rectangle(x, y, width, height));
    }
    public void fillRect(int x,
            int y,
            int width,
            int height) {
        fill(new Rectangle(x, y, width, height));
    }


    public void draw(Shape s) {
        g.draw(s);
    }

    public void rotate(double theta) {
        g.getContext2d().rotate(theta);
    }
    public void rotate(double theta,
            double x,
            double y) {
        translate(x, y);
        rotate(theta);
        translate(-x, -y);
    }


    public void fill(Shape s) {
        g.fill(s);
    }

    public void scale(double sx, double sy) {
        g.getContext2d().scale(sx, sy);
    }

    public FontMetrics getFontMetrics() {
        return fm;
    }


    public void drawString(String str,
            float x,
            float y) {
        g.drawString(str, (int) x, (int) y);
    }


    public void setStroke(BasicStroke s) {
        g.setStroke(s);
    }

}
