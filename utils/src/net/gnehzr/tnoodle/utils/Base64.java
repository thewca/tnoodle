package net.gnehzr.tnoodle.utils;

/*
 * http://www.wikihow.com/Encode-a-String-to-Base64-With-Java
 */
public class Base64 {
 
    private static final String base64code = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            + "abcdefghijklmnopqrstuvwxyz" + "0123456789" + "+/";
 
    private static final int splitLinesAt = 76;
 
    public static byte[] zeroPad(int length, byte[] bytes) {
        byte[] padded = new byte[length]; // initialized to zero by JVM
        System.arraycopy(bytes, 0, padded, 0, bytes.length);
        return padded;
    }

	public static String encodeBytes(byte[] byteArray) {
        // determine how many padding bytes to add to the output
        int paddingCount = (3 - (byteArray.length % 3)) % 3;
        // add any necessary padding to the input
        byteArray = zeroPad(byteArray.length + paddingCount, byteArray);
        // process 3 bytes at a time, churning out 4 output bytes
        // worry about CRLF insertions later
        StringBuffer encoded = new StringBuffer();
        for (int i = 0; i < byteArray.length; i += 3) {
            int j = ((byteArray[i] & 0xff) << 16) +
                ((byteArray[i + 1] & 0xff) << 8) + 
                (byteArray[i + 2] & 0xff);
            encoded.append(base64code.charAt((j >> 18) & 0x3f))
            	.append(base64code.charAt((j >> 12) & 0x3f))
                .append(base64code.charAt((j >> 6) & 0x3f))
                .append(base64code.charAt(j & 0x3f));
        }
        // replace encoded padding nulls with "="
        return splitLines(encoded.substring(0, encoded.length() -
            paddingCount) + "==".substring(0, paddingCount));
	}
	
    public static String encode(String string) {
        byte[] byteArray;
        try {
            byteArray = string.getBytes("UTF-8");  // use appropriate encoding string!
        } catch (Exception ignored) {
            byteArray = string.getBytes();  // use locale default rather than croak
        }
        return encodeBytes(byteArray);
    }
    public static String splitLines(String string) {
 
        StringBuffer lines = new StringBuffer();
        for (int i = 0; i < string.length(); i += splitLinesAt) {
 
            lines.append(string.substring(i, Math.min(string.length(), i + splitLinesAt)));
            lines.append("\r\n");
 
        }
        return lines.toString();
 
    }
    public static void main(String[] args) {
 
        for (int i = 0; i < args.length; i++) {
 
            System.err.println("encoding \"" + args[i] + "\"");
            System.out.println(encode(args[i]));
 
        }
 
    }
 
}
