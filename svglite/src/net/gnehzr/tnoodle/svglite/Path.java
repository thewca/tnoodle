package net.gnehzr.tnoodle.svglite;

import static net.gnehzr.tnoodle.svglite.Utils.azzert;

import java.util.ArrayList;

public class Path extends Element {

    class Command {
        int type;
        double[] coords;
        public Command(int type, double[] coords) {
            this.type = type;
            this.coords = coords;
        }
        public String toString() {
            StringBuilder sb = new StringBuilder();
            sb.append(PathIterator.SVG_LANGUAGE_COMMANDS.charAt(type));
            for(int i = 0; coords != null && i < coords.length; i++) {
                sb.append(" ");
                sb.append(coords[i]);
            }
            return sb.toString();
        }
    }

    ArrayList<Command> commands = null;

    public Path() {
        super("path");
    }

    public PathIterator getPathIterator() {
        return new PathIterator(this);
    }

    public void moveTo(double x, double y) {
        if(commands == null) {
            commands = new ArrayList<Command>();
        }

        int type = PathIterator.SEG_MOVETO;
        double[] coords = new double[] { x, y };
        commands.add(new Command(type, coords));
    }

    private void azzertMoveTo() {
        azzert(commands != null, "First command must be moveTo");
    }

    public void lineTo(double x, double y) {
        azzertMoveTo();

        int type = PathIterator.SEG_LINETO;
        double[] coords = new double[] { x, y };
        commands.add(new Command(type, coords));
    }

    public void closePath() {
        azzertMoveTo();

        int type = PathIterator.SEG_CLOSE;
        double[] coords = null;
        commands.add(new Command(type, coords));
    }

    public void translate(double x, double y) {
        for(Command c : commands) {
            switch(c.type) {
                case PathIterator.SEG_MOVETO:
                case PathIterator.SEG_LINETO:
                    c.coords[0] += x;
                    c.coords[1] += y;
                    break;
                case PathIterator.SEG_CLOSE:
                    break;
                default:
                    azzert(false);
            }
        }
    }

    public String getD() {
        StringBuilder sb = new StringBuilder();
        for(Command c : commands) {
            sb.append(" " + c.toString());
        }
        if(sb.length() == 0) {
            return "";
        }
        return sb.substring(1);
    }

    public void buildString(StringBuilder sb, int level) {
        // We're about to get dumped to a string, lets update
        // our "d" attribute first.
        setAttribute("d", getD());
        super.buildString(sb, level);
    }


}
