package net.gnehzr.tnoodle.android;

import java.io.IOException;
import java.util.SortedMap;

import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.PuzzlePlugins;
import android.graphics.Color;
import net.gnehzr.tnoodle.utils.LazyInstantiator;

/**
 * Created by jeremy on 12/14/13.
 */
public class Test {
    public static void foo() {
        try {
            SortedMap<String, LazyInstantiator<Puzzle>> s = PuzzlePlugins.getScramblers();
        } catch (IOException e) {
            e.printStackTrace();
        }
        System.out.println(PuzzlePlugins.class);//<<<
        System.out.println(Color.class);//<<<
        System.out.println(java.awt.Color.class);//<<<
    }
}
