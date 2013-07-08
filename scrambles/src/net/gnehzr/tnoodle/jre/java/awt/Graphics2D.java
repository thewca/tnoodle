package java.awt;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import java.util.ArrayList;
import java.util.HashMap;
import java.awt.geom.PathIterator;

import net.gnehzr.tnoodle.utils.GwtSafeUtils;

import org.vectomatic.dom.svg.OMSVGPathSeg;
import org.vectomatic.dom.svg.itf.ISVGTransformable;
import org.vectomatic.dom.svg.OMSVGDocument;
import org.vectomatic.dom.svg.OMSVGEllipseElement;
import org.vectomatic.dom.svg.OMSVGElement;
import org.vectomatic.dom.svg.OMSVGLength;
import org.vectomatic.dom.svg.OMSVGPathElement;
import org.vectomatic.dom.svg.OMSVGPathSegList;
import org.vectomatic.dom.svg.OMSVGRectElement;
import org.vectomatic.dom.svg.OMSVGSVGElement;
import org.vectomatic.dom.svg.OMSVGGElement;
import org.vectomatic.dom.svg.utils.SVGConstants;
import org.vectomatic.dom.svg.OMSVGTransformList;
import org.vectomatic.dom.svg.OMSVGTransform;

public class Graphics2D {
    public static final int FONT_SIZE_PX = 12;

    private OMSVGDocument doc;
    private OMSVGSVGElement svg;
    public OMSVGGElement g;
    private FontMetrics fm;
    public Graphics2D(OMSVGDocument doc, OMSVGSVGElement svg) {
        this.doc = doc;
        this.svg = svg;
        this.g = doc.createSVGGElement();
        svg.appendChild(g);

        // Set up the java defaults
        setStroke(new BasicStroke());

        svg.getStyle().setSVGProperty(SVGConstants.CSS_FONT_SIZE_PROPERTY, FONT_SIZE_PX + "px");

        // Because of antialiasing, horizontal and vertical lines appear blurry.
        // This avoids that problem (at least, only for cube scrambles).
        OMSVGTransformList transforms = g.getTransform().getBaseVal();
        OMSVGTransform t = svg.createSVGTransform();
        t.setTranslate(0.5f, 0.5f);
        transforms.appendItem(t);

        fm = new FontMetrics();
    }

    // Modified so we don't have to copy around the RenderingHints.Key
    // class.
    public void setRenderingHint(int hintKey, int hintValue) { }

    private Color c;
    private String hexColor;
    public void setColor(Color c) {
        this.c = c;
        hexColor = "#" + GwtSafeUtils.toHex(c);
    }

    private OMSVGEllipseElement createEllipse(int x, int y, int width, int height) {
        float radiusX = width/2.0f;
        float radiusY = height/2.0f;
        OMSVGEllipseElement oval = doc.createSVGEllipseElement(x + radiusX, y + radiusY, radiusX, radiusY);
        return oval;
    }
    public void drawOval(int x,
            int y,
            int width,
            int height) {
        OMSVGEllipseElement oval = createEllipse(x, y, width, height);
        draw(oval);
    }
    public void fillOval(int x,
            int y,
            int width,
            int height) {
        OMSVGEllipseElement oval = createEllipse(x, y, width, height);
        fill(oval);
    }

    public void drawRect(int x,
            int y,
            int width,
            int height) {
        OMSVGRectElement square = doc.createSVGRectElement(x, y, width, height, 0, 0);
        draw(square);
    }
    public void fillRect(int x,
            int y,
            int width,
            int height) {
        OMSVGRectElement square = doc.createSVGRectElement(x, y, width, height, 0, 0);
        fill(square);
    }

    public OMSVGPathElement shapeToPathElement(Shape s) {
        OMSVGPathElement path = doc.createSVGPathElement();
        OMSVGPathSegList segs = path.getPathSegList();

        PathIterator pi = s.getPathIterator(null);
        float[] coords = new float[6];
        while(!pi.isDone()) {
            int type = pi.currentSegment(coords);
            float x = coords[0];
            float y = coords[1];
            float x1 = coords[2];
            float y1 = coords[3];
            float x2 = coords[4];
            float y2 = coords[5];

            OMSVGPathSeg seg;
            switch(type) {
                case PathIterator.SEG_CLOSE:
                    seg = path.createSVGPathSegClosePath();
                    break;
                case PathIterator.SEG_CUBICTO:
                    seg = path.createSVGPathSegCurvetoCubicAbs(x, y, x1, y1, x2, y2);
                    break;
                case PathIterator.SEG_LINETO:
                    seg = path.createSVGPathSegLinetoAbs(x, y);
                    break;
                case PathIterator.SEG_MOVETO:
                    seg = path.createSVGPathSegMovetoAbs(x, y);
                    break;
                case PathIterator.SEG_QUADTO:
                    seg = path.createSVGPathSegCurvetoQuadraticAbs(x, y, x1, y1);
                    break;
                default:
                    seg = null; // appease java compiler
                    azzert(false);
            }

            segs.appendItem(seg);

            pi.next();
        }
        return path;
    }

    public void draw(Shape s) {
        OMSVGPathElement path = shapeToPathElement(s);
        draw(path);
    }

    public void fill(Shape s) {
        OMSVGPathElement path = shapeToPathElement(s);
        fill(path);
    }

    private void transform(OMSVGElement s) {
        // Transform s according to the list of transformations that have already
        // been applied to this Graphics2D instance.
        ISVGTransformable transformable = (ISVGTransformable) s;
        OMSVGTransformList transforms = transformable.getTransform().getBaseVal();
        for(OMSVGTransform transform : transformations) {
            // Apparently you're not allowed to use the same OMSVGTransform
            // in multiple OMSVGTransformList's at the same time, so we make
            // a copy of it first.
            OMSVGTransform transformCopy = svg.createSVGTransform();
            transformCopy.setMatrix(transform.getMatrix());
            transforms.appendItem(transformCopy);
        }
        transforms.consolidate();
    }
    public void draw(OMSVGElement s) {
        transform(s);

        s.getStyle().setSVGProperty(SVGConstants.CSS_STROKE_PROPERTY, hexColor);
        s.getStyle().setSVGProperty(SVGConstants.CSS_FILL_PROPERTY, SVGConstants.CSS_NONE_VALUE);
        g.appendChild(s);
    }

    private void fill(OMSVGElement s) {
        transform(s);

        s.getStyle().setSVGProperty(SVGConstants.CSS_STROKE_PROPERTY, "none");
        s.getStyle().setSVGProperty(SVGConstants.CSS_FILL_PROPERTY, hexColor);
        g.appendChild(s);
    }


    private ArrayList<OMSVGTransform> transformations = new ArrayList<OMSVGTransform>();
    public void rotate(double thetaRadians) {
        rotate(thetaRadians, 0, 0);
    }
    public void rotate(double thetaRadians,
            double x,
            double y) {
        double thetaDegrees = Math.toDegrees(thetaRadians);
        OMSVGTransform t = svg.createSVGTransform();
        t.setRotate((float) thetaDegrees, (float) x, (float) y);
        transformations.add(t);
    }

    public void scale(double sx, double sy) {
        OMSVGTransform t = svg.createSVGTransform();
        t.setScale((float) sx, (float) sy);
        transformations.add(t);
    }

    public void translate(double tx, double ty) {
        OMSVGTransform t = svg.createSVGTransform();
        t.setTranslate((float) tx, (float) ty);
        transformations.add(t);
    }

    public FontMetrics getFontMetrics() {
        return fm;
    }


    public void drawString(String str,
            float x,
            float y) {
        OMSVGElement e = doc.createSVGTextElement(x, y, OMSVGLength.SVG_LENGTHTYPE_PX, str);
        fill(e);
    }


    // TODO - this writes to svg, which means it affects *all* elements in this svg,
    // rather than just the upcoming ones. Since we don't currently call setStroke()
    // in the middle of our drawing, this is fine, but if that should ever change, this
    // method will need to be updated.
    public void setStroke(BasicStroke s) {
        HashMap<Integer, String> javaJoinToSvgJoin = new HashMap<Integer, String>();
        javaJoinToSvgJoin.put(BasicStroke.JOIN_BEVEL, SVGConstants.CSS_BEVEL_VALUE);
        javaJoinToSvgJoin.put(BasicStroke.JOIN_MITER, SVGConstants.CSS_MITER_VALUE);
        javaJoinToSvgJoin.put(BasicStroke.JOIN_ROUND, SVGConstants.CSS_ROUND_VALUE);

        HashMap<Integer, String> javaCapToSvgCap = new HashMap<Integer, String>();
        javaJoinToSvgJoin.put(BasicStroke.CAP_BUTT, SVGConstants.CSS_BUTT_VALUE);
        javaJoinToSvgJoin.put(BasicStroke.CAP_ROUND, SVGConstants.CSS_ROUND_VALUE);
        javaJoinToSvgJoin.put(BasicStroke.CAP_SQUARE, SVGConstants.CSS_SQUARE_VALUE);

        String svgJoin = javaJoinToSvgJoin.get(s.getLineJoin());
        svg.getStyle().setSVGProperty(SVGConstants.SVG_STROKE_LINEJOIN_ATTRIBUTE, svgJoin);

        String svgCap = javaCapToSvgCap.get(s.getLineJoin());
        svg.getStyle().setSVGProperty(SVGConstants.SVG_STROKE_LINECAP_ATTRIBUTE, svgCap);

        svg.getStyle().setSVGProperty(SVGConstants.CSS_STROKE_WIDTH_PROPERTY, "" + s.getLineWidth());

        svg.getStyle().setSVGProperty(SVGConstants.CSS_STROKE_MITERLIMIT_PROPERTY, "" + s.getMiterLimit());
    }

}
