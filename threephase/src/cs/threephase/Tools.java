package cs.threephase;

import java.io.*;

public class Tools {

	private static void read(int[] arr, DataInput in) throws IOException {
		for (int i=0, len=arr.length; i<len; i++) {
			arr[i] = in.readInt();
		}
	}

	private static void write(int[] arr, DataOutput out) throws IOException {
		for (int i=0, len=arr.length; i<len; i++) {
			out.writeInt(arr[i]);
		}
	}

	private static void read(int[][] arr, DataInput in) throws IOException {
		for (int i=0, leng=arr.length; i<leng; i++) {
			for (int j=0, len=arr[i].length; j<len; j++) {
				arr[i][j] = in.readInt();
			}
		}	
	}

	private static void write(int[][] arr, DataOutput out) throws IOException {
		for (int i=0, leng=arr.length; i<leng; i++) {
			for (int j=0, len=arr[i].length; j<len; j++) {
				out.writeInt(arr[i][j]);
			}
		}	
	}

	public synchronized static void initFrom(DataInput in) throws IOException {
		if (Search.inited) {
			return;
		}

		System.out.println("Initialize Center1 Solver...");

		Center1.initSym();
		Center1.initSym2Raw();
		read(Center1.ctsmv, in);
		Center1.createPrun();

		System.out.println("Initialize Center2 Solver...");

		Center2.init();

		System.out.println("Initialize Center3 Solver...");

		Center3.init();

		System.out.println("Initialize Edge3 Solver...");

		Edge3.initMvrot();
		Edge3.initRaw2Sym();
		read(Edge3.eprun, in);

		System.out.println("OK");		

		Search.inited = true;
	}

	public synchronized static void saveTo(DataOutput out) throws IOException {
		if (!Search.inited) {
			Search.init();
		}
		write(Center1.ctsmv, out);
		write(Edge3.eprun, out);
	}
}