package java.awt;

import com.google.gwt.canvas.client.Canvas;
import com.google.gwt.canvas.dom.client.Context2d;
import com.google.gwt.canvas.dom.client.TextMetrics;

public class FontMetrics {
    private Canvas c;
    private Context2d context;
    public FontMetrics() {
        c = Canvas.createIfSupported();
        context = c.getContext2d();
    }

    public int stringWidth(String str) {
        TextMetrics metrics = context.measureText(str);
        return (int) metrics.getWidth();
    }
    
    public int getAscent() {
        String font = context.getFont();
        String size = font.split(" ")[0];
        return Integer.parseInt(size.substring(0, size.length() - "px".length()));
    }

}
