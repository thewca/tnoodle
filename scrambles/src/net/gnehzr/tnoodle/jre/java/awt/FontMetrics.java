package java.awt;

import com.google.gwt.canvas.dom.client.Context2d;
import com.google.gwt.canvas.dom.client.TextMetrics;

public class FontMetrics {
    private Context2d context;
    public FontMetrics(Context2d context) {
        this.context = context;
    }

    public int stringWidth(String str) {
        TextMetrics metrics = context.measureText(str);
        return (int) metrics.getWidth();
    }
    
    public int getAscent() {
        String font = context.getFont();
        String size = font.split(" ")[0];
        return Integer.parseInt(size.substring(0, size.length() - 2));
    }

}
