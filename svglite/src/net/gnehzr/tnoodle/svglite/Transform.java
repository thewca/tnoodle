package net.gnehzr.tnoodle.svglite;

public class Transform {

    private Transform preTransform;
    private String type;
    private double[] args;
    private Transform(String type, double... args) {
        this.type = type;
        this.args = args;
    }

    public Transform() {}
    public Transform(Transform t) {
        setTransform(t);
    }

    public void concatenate(Transform t) {
        this.preTransform = new Transform(this);
        this.type = t.type;
        this.args = t.args;
    }

    public void setTransform(Transform t) {
        this.type = t.type;
        this.args = t.args;
        this.preTransform = t.preTransform;
    }

    public void setToIdentity() {
        this.type = null;
        this.args = null;
    }

    public boolean isIdentity() {
        return this.type == null && this.args == null;
    }

    public static Transform getTranslateInstance(double tx, double ty) {
        return new Transform("translate", tx, ty);
    }

    public static Transform getRotateInstance(double radians, double anchorx, double anchory) {
        double degrees = Math.toDegrees(radians);
        return new Transform("rotate", degrees, anchorx, anchory);
    }

    public void rotate(double radians, double anchorx, double anchory) {
        concatenate(Transform.getRotateInstance(radians, anchorx, anchory));
    }

    public void rotate(double radians) {
        concatenate(Transform.getRotateInstance(radians));
    }

    public void translate(double x, double y) {
        concatenate(Transform.getTranslateInstance(x, y));
    }

    public static Transform getRotateInstance(double radians) {
        return getRotateInstance(radians, 0, 0);
    }

    public String toSvgTransform() {
        StringBuilder sb = new StringBuilder();
        appendSvgTransform(sb);
        return sb.toString();
    }

    public void appendSvgTransform(StringBuilder sb) {
        if(isIdentity()) {
            return;
        }
        sb.append(type).append("(");
        boolean spaceNeeded = false;
        for(double arg : args) {
            if(spaceNeeded) {
                sb.append(" ");
            }
            sb.append(arg);
            spaceNeeded = true;
        }
        sb.append(")");
        // Svg transforms are applied right to left
        if(preTransform != null) {
            sb.append(" ");
            preTransform.appendSvgTransform(sb);
        }
    }

}
