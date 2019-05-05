package cs.threephase;

import java.io.*;
import java.util.*;
import cs.threephase.Search;


public class test {

	public static void main(String[] args) {

		// try {
		// 	DataInputStream dis = new DataInputStream(new BufferedInputStream(new FileInputStream("twophase.data")));
		// 	cs.min2phase.Tools.initFrom(dis);
		// 	dis.close();
		// } catch (IOException e) {
		// 	e.printStackTrace();
		// 	try {
		// 		DataOutputStream dos = new DataOutputStream(new BufferedOutputStream(new FileOutputStream("twophase.data")));
		// 		cs.min2phase.Tools.saveTo(dos);
		// 		dos.close();
		// 	} catch (IOException e2) {
		// 		e2.printStackTrace();
		// 	}
		// }

		try {
			DataInputStream dis = new DataInputStream(new BufferedInputStream(new FileInputStream("threephase.data")));
			cs.threephase.Tools.initFrom(dis);
			dis.close();
		} catch (IOException e) {
			e.printStackTrace();
			try {
				DataOutputStream dos = new DataOutputStream(new BufferedOutputStream(new FileOutputStream("threephase.data")));
				cs.threephase.Tools.saveTo(dos);
				dos.close();
			} catch (IOException e2) {
				e2.printStackTrace();
			}
		}

		int n_solve;
		if (args.length == 0) {
			n_solve = 0;
		} else {
			n_solve = Integer.parseInt(args[0]);
		}
		int tot_length = 0;
		long tot_time = 0L;
		long start;
		Search first = new Search();
		int[] dis = new int[60];
		int lasttot = 0;
		Random r = new Random(42L);
		for (int i=n_solve; i!=0; --i) {
			start = System.nanoTime();
			String val = first.randomState(r);
			int cur_len = val.length() / 4;
			long cur_time = System.nanoTime() - start;
			tot_length += cur_len;
			tot_time += cur_time;
			System.out.println(val);
			dis[cur_len]++;
			for (int j=0; j<60; j++) {
				if (dis[j] != 0) {
					System.out.println(String.format("%d\t%d\t%d", (n_solve-i+1), j, dis[j]));
				}
			}
			System.out.println(String.format("%5.2f\t%f", tot_length / 1.0 / (n_solve-i+1), tot_time / (n_solve-i+1) / 1000000.0));
		}

	}
}
