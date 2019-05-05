package net.gnehzr.tnoodle.svglite;

import static net.gnehzr.tnoodle.svglite.Utils.azzert;

import java.util.ArrayList;
import java.util.HashMap;

public class Element {
    
    protected String tag;
    protected HashMap<String, String> attributes;
    protected HashMap<String, String> style;
    protected ArrayList<Element> children;
    protected String content;
    public Element(String tag) {
        this.tag = tag;
        this.children = new ArrayList<Element>();
        this.attributes = new HashMap<String, String>();
        this.style = new HashMap<String, String>();
        this.content = null;
    }

    public Element(Element e) {
        this.tag = e.tag;
        this.attributes = new HashMap<String, String>(e.attributes);
        this.style = new HashMap<String, String>(e.style);
        this.children = e.copyChildren();
        this.content = content;
    }

    protected ArrayList<Element> copyChildren() {
        ArrayList<Element> childrenCopy = new ArrayList<Element>();
        for(Element child : children) {
            childrenCopy.add(new Element(child));
        }
        return childrenCopy;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public ArrayList<Element> getChildren() {
        return children;
    }

    public void appendChild(Element child) {
        children.add(child);
    }

    public HashMap<String, String> getAttributes() {
        return attributes;
    }

    public String getAttribute(String key) {
        azzert(key != "style");
        return attributes.get(key);
    }

    public void setAttribute(String key, String value) {
        azzert(key != "style");
        attributes.put(key, value);
    }

    public void setStyle(String key, String value) {
        style.put(key, value);
    }

    public String getStyle(String key) {
        return style.get(key);
    }

    public HashMap<String, String> getStyle() {
        return style;
    }

    private String colorToStr(Color c) {
        return c == null ? "none" : "#" + c.toHex();
    }

    public String toStyleStr() {
        StringBuilder sb = new StringBuilder();
        for(String key : style.keySet()) {
            String value = style.get(key);
            sb.append(" ").append(key).append(":").append(value).append(";");
        }
        if(sb.length() == 0) {
            return "";
        }
        return sb.substring(1);
    }

    private void addIndentation(StringBuilder sb, int level) {
        for(int i = 0; i < level; i++) {
            sb.append("\t");
        }
    }

    public void buildString(StringBuilder sb, int level) {
        addIndentation(sb, level);
        sb.append("<").append(tag);
        for(String key : attributes.keySet()) {
            String value = attributes.get(key);
            sb.append(" ");
            sb.append(key).append("=").append('"').append(value).append('"');
        }
        if(style.size() > 0) {
            sb.append(" style=\"").append(toStyleStr()).append('"');
        }
        if(!transform.isIdentity()) {
            sb.append(" transform=\"").append(transform.toSvgTransform()).append('"');
        }
        sb.append(">");
        if(content != null) {
            sb.append(content);
        }
        for(Element child : children) {
            sb.append("\n");
            child.buildString(sb, level + 1);
        }
        sb.append("\n");
        addIndentation(sb, level);
        sb.append("</").append(tag).append(">");
    }

    public String toString() {
        StringBuilder sb = new StringBuilder();
        buildString(sb, 0);
        return sb.toString();
    }

    public void setFill(Color c) {
        setAttribute("fill", colorToStr(c));
    }

    public void setStroke(Color c) {
        setAttribute("stroke", colorToStr(c));
    }

    public void setStroke(int strokeWidth, int miterLimit, String lineJoin) {
        setStyle("stroke-width", strokeWidth + "px");
        setStyle("stroke-miterlimit", "" + miterLimit);
        setStyle("stroke-linejoin", lineJoin);
    }

    private Transform transform = new Transform();
    public void transform(Transform t) {
        transform.concatenate(t);
    }

    public void setTransform(Transform t) {
        if(t == null) {
            transform.setToIdentity();
        } else {
            transform.setTransform(t);
        }
    }

    public Transform getTransform() {
        return new Transform(transform);
    }

    public void rotate(double radians, double anchorx, double anchory) {
        transform.rotate(radians, anchorx, anchory);
    }

    public void rotate(double radians) {
        transform.rotate(radians);
    }

    public void translate(double x, double y) {
        transform.translate(x, y);
    }

}
