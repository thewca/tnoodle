package net.gnehzr.tnoodle.server.webscrambles;

import java.util.regex.Pattern;

public class Utils {
    
    private static final String INVALID_CHARS = "\\/:*?\"<>|";
    public static String toFileSafeString(String unsafe) {
        for(int i = 0; i < INVALID_CHARS.length(); i++) {
            String invalidChar = Pattern.quote("" + INVALID_CHARS.charAt(i));
            unsafe = unsafe.replaceAll(invalidChar, "");
        }
        String safe = unsafe.trim().replaceAll(" +", " ");
        return safe;
    }

}
