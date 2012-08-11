package cs.threephase;

import java.io.*;

class Util {

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
	
	static OutputStream getOutput(String filename) throws IOException {
		return new BufferedOutputStream(new FileOutputStream(filename));
	}
	
	static InputStream getInput(String filename) throws IOException {
		return new BufferedInputStream(new FileInputStream(filename));
	}
	
	static boolean write(byte[] data, int idx, int length, String filename) {
		try {
			OutputStream os = getOutput(filename);
			os.write(data, idx, length);
			os.close();
			return true;
		} catch (IOException e) {
//			e.printStackTrace();
			return false;
		}	
	}
	
	static boolean read(byte[] data, int idx, int length, String filename) {
		try {
			InputStream is = getInput(filename);
			is.read(data, idx, length);
			is.close();
			return true;
		} catch (IOException e) {
//			e.printStackTrace();
			return false;
		}		
	}

	static boolean read(int[][] data, int l, int r, int width, String filename) {
		try {
			InputStream is = getInput(filename);
			byte[] buf = new byte[width * 4];
			for (int i=l; i<r; i++) {
				is.read(buf);
				for (int j=0; j<width; j++) {
					data[i][j] = (buf[j*4])&0xff | (buf[j*4+1]<<8)&0xff00 | (buf[j*4+2]<<16)&0xff0000 | (buf[j*4+3]<<24)&0xff000000;
				}
			}
			is.close();
			return true;
		} catch (IOException e) {
//			e.printStackTrace();
			return false;
		}
	}
	
	static boolean write(int[][] data, int l, int r, int width, String filename) {
		try {
			OutputStream os = getOutput(filename);
			byte[] buf = new byte[width * 4];
			for (int i=l; i<r; i++) {
				int idx = 0;
				for (int j=0; j<width; j++) {
					buf[idx++] = (byte)(data[i][j] & 0xff);
					buf[idx++] = (byte)((data[i][j]>>>8) & 0xff);
					buf[idx++] = (byte)((data[i][j]>>>16) & 0xff);
					buf[idx++] = (byte)((data[i][j]>>>24) & 0xff);
				}
				os.write(buf);
			}
			os.close();
			return true;
		} catch (IOException e) {
//			e.printStackTrace();
			return false;
		}
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
