package net.gnehzr.tnoodle.svglite;

public class Transform {
    // TODO - I don't know how to pick a good value here, should it be zero?
    private static final double NEAR_THRESHOLD = 0.000001;

    // a-f comprise the transformation matrix:
    //  [ a c e ]
    //  [ b d f ]
    //  [ 0 0 1 ]
    private double a, b, c, d, e, f;
    public Transform(double a, double b, double c, double d, double e, double f) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
    }

    public Transform() {
        setToIdentity();
    }

    public Transform(Transform t) {
        setTransform(t);
    }

    public void concatenate(Transform that) {
        Transform left = that;
        Transform right = this;
        double a = left.a*right.a + left.c*right.b;
        double c = left.a*right.c + left.c*right.d;
        double e = left.a*right.e + left.c*right.f + left.e;
        double b = left.b*right.a + left.d*right.b;
        double d = left.b*right.c + left.d*right.d;
        double f = left.b*right.e + left.d*right.f + left.f;

        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
    }

    public void setTransform(Transform t) {
        this.a = t.a;
        this.b = t.b;
        this.c = t.c;
        this.d = t.d;
        this.e = t.e;
        this.f = t.f;
    }

    public void setToIdentity() {
        a = d = 1;
        c = e = b = f = 0;
    }

    private static boolean isNear(double a, double b) {
        return -NEAR_THRESHOLD <= a - b && a - b <= NEAR_THRESHOLD;
    }

    public boolean isIdentity() {
        return isNear(a, 1) && isNear(d, 1) &&
                isNear(c, 0) && isNear(e, 0) && isNear(b, 0) && isNear(f, 0);
    }

    public static Transform getTranslateInstance(double tx, double ty) {
        return new Transform(1, 0, 0, 1, tx, ty);
    }

    public static Transform getRotateInstance(double radians, double anchorx, double anchory) {
        Transform trans = new Transform();
        trans.translate(-anchorx, -anchory);
        trans.rotate(radians);
        trans.translate(anchorx, anchory);
        return trans;
    }

    public static Transform getRotateInstance(double radians) {
        double sin = Math.sin(radians);
        double cos = Math.cos(radians);
        return new Transform(cos, sin, -sin, cos, 0, 0);
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

    public String toSvgTransform() {
        return "matrix(" + a + "," + b + "," + c + "," + d + "," + e + "," + f+ ")";
    }

}
