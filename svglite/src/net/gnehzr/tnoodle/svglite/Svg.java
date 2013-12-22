package net.gnehzr.tnoodle.svglite;

public class Svg {
    
    public Svg() {}

    public String toString() {
        return "<?xml version='1.0'?>" +
                "<svg width='120' height='120' " +
                " viewPort='0 0 120 120' version='1.1' " +
                " xmlns='http://www.w3.org/2000/svg'>" +
                          "<circle style='fill: red' cx='60' cy='60' r='50'/>" +
               "</svg>";
    }

    public Dimension getSize() {
        return new Dimension(120, 120); //<<<
    }

}
