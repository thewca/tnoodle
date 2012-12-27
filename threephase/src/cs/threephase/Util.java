package cs.threephase;

import java.io.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.Arrays;

import net.gnehzr.tnoodle.utils.Utils;
import net.gnehzr.tnoodle.utils.TimedLogRecordStart;

public class Util {
        private static final Logger l = Logger.getLogger(Util.class.getName());

	static int[][] Cnk = new int[25][25];
	static int[] fact = new int[13];
	static char[] colorMap4to3 = {'U', 'D', 'F', 'B', 'R', 'L'};

	static {
		for (int i=0; i<25; i++) {
			Cnk[i][i] = 1;
			Cnk[i][0] = 1;
		}
		for (int i=1; i<25; i++) {
			for (int j=1; j<=i; j++) {
				Cnk[i][j] = Cnk[i-1][j] + Cnk[i-1][j-1];
			}
		}
		fact[0] = 1;
		for (int i=0; i<12; i++) {
			fact[i+1] = fact[i] * (i+1);
		}
	}
	
	static void write(byte[] arr, DataOutput out) throws IOException {
		out.write(arr);
	}

	static void read(byte[] arr, DataInput in) throws IOException {
		in.readFully(arr);
	}

	static void read(int[][] arr, DataInput in) throws IOException {
		final int length = arr.length;
		for (int i=0; i<length; i++) {
			final int len = arr[i].length;
			for (int j=0; j<len; j++) {
				arr[i][j] = in.readInt();
			}
		}	
	}
	
	static void write(int[][] arr, DataOutput out) throws IOException {
		final int length = arr.length;
		for (int i=0; i<length; i++) {
			final int len = arr[i].length;
			for (int j=0; j<len; j++) {
				out.writeInt(arr[i][j]);
			}
		}	
	}

	public static synchronized void init() {
		init(true, null);
	}

	private static void prepareTables() {
		Center1.initSym2Raw();
	}

	public static enum InitializationState {
		UNINITIALIZED,
		INITING_CENTER1,
		INITING_EDGE3,
		INITIALIZED;
	}

	public static InitializationState getInitializationState() {
		return inited;
	}

	static volatile InitializationState inited = InitializationState.UNINITIALIZED;

	private static synchronized void init(boolean tryToReadFile, File tpr_tables) {
		if(inited != InitializationState.UNINITIALIZED) {
			return;
		}

		if(tpr_tables == null) {
			tpr_tables = new File(Utils.getResourceDirectory(), "tpr_tables");
			//tpr_tables = new File("tpr_tables");
		}

		prepareTables();
		if(tryToReadFile) {
			try {
				FileInputStream is = new FileInputStream(tpr_tables);
				if(initFrom(new DataInputStream(is))) {
					inited = InitializationState.INITIALIZED;
				}
			} catch (FileNotFoundException e) {
				l.info("Couldn't find " + tpr_tables + ", going to create it.");
			}
		}
		if(inited == InitializationState.UNINITIALIZED) {
			TimedLogRecordStart start = new TimedLogRecordStart(Level.INFO, "Generating threephase tables");
			l.log(start);

			inited = InitializationState.INITING_CENTER1;
			Center1.createMoveTable();
			inited = InitializationState.INITING_EDGE3;
			Edge3.createPrun();

			try {
				l.info("Writing to " + tpr_tables);
				FileOutputStream out = new FileOutputStream(tpr_tables);
				DataOutputStream dataOut = new DataOutputStream(out);
				initTo(dataOut);
			} catch(IOException e) {
				l.log(Level.INFO, "Failed to write to " + tpr_tables, e);
			}
			
			l.log(start.finishedNow());
		}
		inited = InitializationState.INITIALIZED;
	}
	
	public static boolean initFrom(DataInput in) {
		try {
			read(Center1.ctsmv, in);
			read(Edge3.modedTable, in);

			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	public static void initTo(DataOutput out) throws IOException {
		write(Center1.ctsmv, out);
		write(Edge3.modedTable, out);
	}
	
	public static void main(String[] args) throws IOException {
		System.out.println(Arrays.toString(args));
		if(args.length != 1) {
			System.out.println("Please provide 1 argument: the file to store the tables in");
			System.exit(1);
		}
		init(false, new File(args[0]));
	}

	public static void swap(int[] arr, int a, int b, int c, int d, int key) {
		int temp;
		switch (key) {
		case 0:
			temp = arr[d];
			arr[d] = arr[c];
			arr[c] = arr[b];
			arr[b] = arr[a];
			arr[a] = temp;
			return;
		case 1:
			temp = arr[a];
			arr[a] = arr[c];
			arr[c] = temp;
			temp = arr[b];
			arr[b] = arr[d];
			arr[d] = temp;
			return;
		case 2:
			temp = arr[a];
			arr[a] = arr[b];
			arr[b] = arr[c];
			arr[c] = arr[d];
			arr[d] = temp;
			return;
		}
	}
	
	public static void swap(byte[] arr, int a, int b, int c, int d, int key) {
		byte temp;
		switch (key) {
		case 0:
			temp = arr[d];
			arr[d] = arr[c];
			arr[c] = arr[b];
			arr[b] = arr[a];
			arr[a] = temp;
			return;
		case 1:
			temp = arr[a];
			arr[a] = arr[c];
			arr[c] = temp;
			temp = arr[b];
			arr[b] = arr[d];
			arr[d] = temp;
			return;
		case 2:
			temp = arr[a];
			arr[a] = arr[b];
			arr[b] = arr[c];
			arr[c] = arr[d];
			arr[d] = temp;
			return;
		}
	}
	
	static void set8Perm(int[] arr, int idx) {
		int val = 0x76543210;
		for (int i=0; i<7; i++) {
			int p = fact[7-i];
			int v = idx / p;
			idx -= v*p;
			v <<= 2;
			arr[i] = (val >> v) & 0xf;
			int m = (1 << v) - 1;
			val = (val & m) + ((val >> 4) & ~m);
		}
		arr[7] = val;
	}
	
	static void set8Perm(byte[] arr, int idx) {
		int val = 0x76543210;
		for (int i=0; i<7; i++) {
			int p = fact[7-i];
			int v = idx / p;
			idx -= v*p;
			v <<= 2;
			arr[i] = (byte) ((val >> v) & 0xf);
			int m = (1 << v) - 1;
			val = (val & m) + ((val >> 4) & ~m);
		}
		arr[7] = (byte)val;
	}
	
	static int parity(int[] arr) {
		int parity = 0;
		for (int i=0, len=arr.length; i<len; i++) {
			for (int j=i; j<len; j++) {
				if (arr[i] > arr[j]) {
					parity ^= 1;
				}
			}
		}
		return parity;
	}
	
	static int parity(byte[] arr) {
		int parity = 0;
		for (int i=0, len=arr.length; i<len; i++) {
			for (int j=i; j<len; j++) {
				if (arr[i] > arr[j]) {
					parity ^= 1;
				}
			}
		}
		return parity;
	}

}
