package cs.min2phase;

import java.io.DataInput;
import java.io.DataInputStream;
import java.io.DataOutput;
import java.io.DataOutputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Random;

public class Tools {
	static boolean inited = false;
	
	static void read(byte[] arr, DataInput in) throws IOException {
		in.readFully(arr);
	}

	static void read(char[] arr, DataInput in) throws IOException {
		final int length = arr.length;
		for (char i=0; i<length; i++) {
			arr[i] = in.readChar();
		}
	}

	static void read(byte[][] arr, DataInput in) throws IOException {
		final int length = arr.length;
		for (char i=0; i<length; i++) {
			in.readFully(arr[i]);
		}
	}

	static void read(char[][] arr, DataInput in) throws IOException {
		final int length = arr.length;
		for (char i=0; i<length; i++) {
			final int len = arr[i].length;
			for (char j=0; j<len; j++) {
				arr[i][j] = in.readChar();
			}
		}	
	}

	static void write(byte[] arr, DataOutput out) throws IOException {
		out.write(arr);
	}

	static void write(char[] arr, DataOutput out) throws IOException {
		final int length = arr.length;
		for (char i=0; i<length; i++) {
			out.writeChar(arr[i]);
		}
	}

	static void write(byte[][] arr, DataOutput out) throws IOException {
		final int length = arr.length;
		for (char i=0; i<length; i++) {
			out.write(arr[i]);
		}
	}

	static void write(char[][] arr, DataOutput out) throws IOException {
		final int length = arr.length;
		for (char i=0; i<length; i++) {
			final int len = arr[i].length;
			for (char j=0; j<len; j++) {
				out.writeChar(arr[i][j]);
			}
		}	
	}
	
	public static synchronized void init() {
		if (inited)
			return;
		InputStream is = Tools.class.getResourceAsStream("twophase_tables");
		if(!initFrom(new DataInputStream(is))) {
			CubieCube.init();
			CoordCube.init();
		}
		inited = true;
	}
	
	public static boolean initFrom(DataInput in) {
		try {
			read(CubieCube.FlipS2R, in);
			read(CubieCube.TwistS2R, in);
			read(CubieCube.CPermS2R, in);
			read(CubieCube.MtoEPerm, in);
			read(CubieCube.merge, in);
			read(CoordCube.UDSliceMove, in);
			read(CoordCube.TwistMove, in);
			read(CoordCube.FlipMove, in);
			read(CoordCube.UDSliceConj, in);
			read(CoordCube.UDSliceTwistPrun, in);
			read(CoordCube.UDSliceFlipPrun, in);
			read(CoordCube.Mid3Move, in);
			read(CoordCube.Mid32MPerm, in);
			read(CoordCube.CParity, in);
			read(CoordCube.CPermMove, in);
			read(CoordCube.EPermMove, in);
			read(CoordCube.MPermMove, in);
			read(CoordCube.MPermConj, in);
			read(CoordCube.MCPermPrun, in);
			read(CoordCube.MEPermPrun, in);
			read(CoordCube.TwistFlipPrun, in);
			inited = true;
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	public static boolean initTo(DataOutput out) {
		init();
		try {
			write(CubieCube.FlipS2R, out);
				//336 * 2 = 672 Bytes
			write(CubieCube.TwistS2R, out);
				//324 * 2 = 648 Bytes
			write(CubieCube.CPermS2R, out);
				//2768 * 2 = 5536 Bytes
			write(CubieCube.MtoEPerm, out);
				//40320 * 2 = 80640 Bytes
			write(CubieCube.merge, out);
				//56 * 56 = 3136 Bytes
			write(CoordCube.UDSliceMove, out);
				//495 * 18 * 2 = 17820 Bytes
			write(CoordCube.TwistMove, out);
				//324 * 18 * 2 = 11664 Bytes
			write(CoordCube.FlipMove, out);
				//336 * 18 * 2 = 12096 Bytes
			write(CoordCube.UDSliceConj, out);
				//495 * 8 * 2 = 7920 Bytes
			write(CoordCube.UDSliceTwistPrun, out);
				//495 * 324 = 160380 Bytes
			write(CoordCube.UDSliceFlipPrun, out);
				//495 * 336 = 166320 Bytes
			write(CoordCube.Mid3Move, out);
				//1320 * 18 * 2 = 47520 Bytes
			write(CoordCube.Mid32MPerm, out);
				//24 Bytes
			write(CoordCube.CParity, out);
				//2768 / 8 = 346 Bytes
			write(CoordCube.CPermMove, out);
				//2788 * 18 * 2 = 99648 Bytes
			write(CoordCube.EPermMove, out);
				//2788 * 10 * 2 = 55360 Bytes
			write(CoordCube.MPermMove, out);
				//24 * 10 = 240 Bytes
			write(CoordCube.MPermConj, out);
				//24 * 16 = 384 Bytes
			write(CoordCube.MCPermPrun, out);
				//24 * 2768 = 66432 Bytes
			write(CoordCube.MEPermPrun, out);
				//24 * 2768 = 66432 Bytes
			write(CoordCube.TwistFlipPrun, out);
				//336 * 324 * 8 = 870912 Bytes
				//Total : 1674130 Bytes
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}
	
	public static void main(String[] args) throws FileNotFoundException {
		System.out.println(Arrays.toString(args));
		if(args.length != 1) {
			System.out.println("Please provide 1 argument: the file to store the tables in");
			return;
		}
		FileOutputStream out = new FileOutputStream(args[0]);
		DataOutputStream dataOut = new DataOutputStream(out);
		if(!initTo(dataOut)) {
			System.out.println("IHAAAAAA FAILUREEEEE");
			System.exit(1);
		}
	}

	/**
	 * Generates a random cube.
	 * @return A random cube in the string representation. Each cube of the cube space has the same probability.
	 */
	public static String randomCube() {
		Random gen = new Random();
		return randomCube(gen);
	}
	
	public static String randomCube(Random r) {
//		CubieCube cc = new CubieCube();
		int eperm;
		char cperm;
		do {
			eperm = r.nextInt(479001600);
			cperm = (char)r.nextInt(40320);
		} while (((Util.get8Parity(cperm) ^ Util.get12Parity(eperm))) != 0);
		return Util.toFaceCube(new CubieCube(cperm, r.nextInt(2187), eperm, r.nextInt(2048)));
	}
	
	/**
	 * Check if the cube definition string s represents a solvable cube.
	 * 
	 * @param s is the cube definition string , see {@link Facelet}
	 * @return 0: Cube is solvable<br>
	 *         -1: There is not exactly one facelet of each colour<br>
	 *         -2: Not all 12 edges exist exactly once<br>
	 *         -3: Flip error: One edge has to be flipped<br>
	 *         -4: Not all 8 corners exist exactly once<br>
	 *         -5: Twist error: One corner has to be twisted<br>
	 *         -6: Parity error: Two corners or two edges have to be exchanged
	 */
	public static int verify(String facelets) {
		int s;
		// +++++++++++++++++++++check for wrong input +++++++++++++++++++++++++++++
		byte[] count = new byte[6];
		byte[] f = new byte[54];
		try {
			for (byte i=0; i<54; i++) {
				switch (facelets.charAt(i)) {
					case 'U':f[i] = 0;break;
					case 'R':f[i] = 1;break;
					case 'F':f[i] = 2;break;
					case 'D':f[i] = 3;break;
					case 'L':f[i] = 4;break;
					case 'B':f[i] = 5;break;
					default:
						System.out.println((int)facelets.charAt(i));
						System.out.println(i);
						System.out.println(facelets.length());
						return -1;
				}
				count[f[i]]++;
			}
		} catch (Exception e) {
			e.printStackTrace();
			return -1;
		}
		for (byte i=0; i<6; i++)
			if (count[i] != 9) {
				return -1;
			}
		CubieCube cc = Util.toCubieCube(f);
		if ((s = cc.verify()) != 0)
			return s;
		return 0;
	}		
}
