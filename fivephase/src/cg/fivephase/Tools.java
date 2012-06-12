package cg.fivephase;

import static cg.fivephase.Constants.*;

import java.io.DataInput;
import java.io.DataInputStream;
import java.io.DataOutput;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.Random;

import net.gnehzr.tnoodle.utils.Utils;

public class Tools {
	static boolean inited = false;
	
	static void read(byte[] arr, DataInput in) throws IOException {
		in.readFully(arr);
	}

	static void read(short[] arr, DataInput in) throws IOException {
		final int length = arr.length;
		for (int i=0; i<length; i++) {
			arr[i] = in.readShort();
		}
	}

	static void read(int[] arr, DataInput in) throws IOException {
		final int length = arr.length;
		for (int i=0; i<length; i++) {
			arr[i] = in.readInt();
		}
	}

	static void read(byte[][] arr, DataInput in) throws IOException {
		final int length = arr.length;
		for (char i=0; i<length; i++) {
			in.readFully(arr[i]);
		}
	}

	static void read(short[][] arr, DataInput in) throws IOException {
		final int length = arr.length;
		for (int i=0; i<length; i++) {
			final int len = arr[i].length;
			for (int j=0; j<len; j++) {
				arr[i][j] = in.readShort();
			}
		}	
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

	static void write(byte[] arr, DataOutput out) throws IOException {
		out.write(arr);
	}

	static void write(short[] arr, DataOutput out) throws IOException {
		final int length = arr.length;
		for (int i=0; i<length; i++) {
			out.writeShort(arr[i]);
		}
	}

	static void write(int[] arr, DataOutput out) throws IOException {
		final int length = arr.length;
		for (int i=0; i<length; i++) {
			out.writeInt(arr[i]);
		}
	}

	static void write(byte[][] arr, DataOutput out) throws IOException {
		final int length = arr.length;
		for (char i=0; i<length; i++) {
			out.write(arr[i]);
		}
	}

	static void write(short[][] arr, DataOutput out) throws IOException {
		final int length = arr.length;
		for (int i=0; i<length; i++) {
			final int len = arr[i].length;
			for (int j=0; j<len; j++) {
				out.writeShort(arr[i][j]);
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
		if (inited)
			return;
		
		Symmetry.init();
		Tables.init();
		CubeStage1.prune_table = new PruningStage1();
		CubeStage1.prune_table.init();

		CubeStage2.prune_table_edgcen = new PruningStage2EdgCen();
		CubeStage2.prune_table_edgcen.init();

		CubeStage3.prune_table_cen = new PruningStage3Cen();
		CubeStage3.prune_table_cen.init();
		CubeStage3.prune_table_edg = new PruningStage3Edg();
		CubeStage3.prune_table_edg.init();

		CubeStage4.prune_table = new PruningStage4();
		CubeStage4.prune_table.init();

		CubeStage5.prune_table_edgcen = new PruningStage5EdgCen();
		CubeStage5.prune_table_edgcen.init();
		CubeStage5.prune_table_edgcor = new PruningStage5EdgCor();
		CubeStage5.prune_table_edgcor.init();

		try {
			FileInputStream is = new FileInputStream(new File(Utils.getResourceDirectory(), "fivephase_tables"));
			inited = initFrom(new DataInputStream(is));
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		if(!inited) {
			Tables.init_tables ();
			CubeStage1.prune_table.analyse();
			CubeStage2.prune_table_edgcen.analyse();
			CubeStage3.prune_table_cen.analyse();
			CubeStage3.prune_table_edg.analyse();
			CubeStage4.prune_table.analyse();
			CubeStage5.prune_table_edgcen.analyse();
			CubeStage5.prune_table_edgcor.analyse();
		}
		inited = true;
	}
	
	public static boolean initFrom(DataInput in) {
		try {
			read(Tables.symEdgeToEdgeSTAGE1, in);
			read(Tables.move_table_symEdgeSTAGE1, in);
			read(Tables.move_table_co, in);
			read(Tables.move_table_co_conj, in);
			read(Tables.move_table_edgeSTAGE2, in);
			read(Tables.move_table_edge_conjSTAGE2, in);
			read(Tables.symCenterToCenterSTAGE2, in);
			read(Tables.move_table_symCenterSTAGE2, in);
			read(Tables.symCenterToCenterSTAGE3, in);
			read(Tables.move_table_symCenterSTAGE3, in);
			read(Tables.move_table_edgeSTAGE3, in);
			read(Tables.move_table_edge_conjSTAGE3, in);
			read(Tables.stage4_edge_hB, in);
			read(Tables.stage4_edge_hgB, in);
			read(Tables.stage4_edge_hgA, in);
			read(Tables.symEdgeToEdgeSTAGE4, in);
			read(Tables.move_table_symEdgeSTAGE4, in);
			read(Tables.move_table_cornerSTAGE4, in);
			read(Tables.move_table_corner_conjSTAGE4, in);
			read(Tables.move_table_cenSTAGE4, in);
			read(Tables.move_table_cen_conjSTAGE4, in);
			read(Tables.move_table_cornerSTAGE5, in);
			read(Tables.move_table_corner_conjSTAGE5, in);
			read(Tables.move_table_cenSTAGE5, in);
			read(Tables.move_table_cen_conjSTAGE5, in);
			read(Tables.symEdgeToEdgeSTAGE5, in);
			read(Tables.move_table_symEdgeSTAGE5, in);

			read(CubeStage1.prune_table.ptable_packed, in);
			read(CubeStage2.prune_table_edgcen.ptable, in);
			read(CubeStage3.prune_table_cen.ptable, in);
			read(CubeStage3.prune_table_edg.ptable, in);
			read(CubeStage4.prune_table.ptable_packed, in);
			read(CubeStage5.prune_table_edgcen.ptable_packed, in);
			read(CubeStage5.prune_table_edgcor.ptable, in);

			inited = true;
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	public static void initTo(DataOutput out) throws IOException {
		init();
		write(Tables.symEdgeToEdgeSTAGE1, out);
		write(Tables.move_table_symEdgeSTAGE1, out);
		write(Tables.move_table_co, out);
		write(Tables.move_table_co_conj, out);
		write(Tables.move_table_edgeSTAGE2, out);
		write(Tables.move_table_edge_conjSTAGE2, out);
		write(Tables.symCenterToCenterSTAGE2, out);
		write(Tables.move_table_symCenterSTAGE2, out);
		write(Tables.symCenterToCenterSTAGE3, out);
		write(Tables.move_table_symCenterSTAGE3, out);
		write(Tables.move_table_edgeSTAGE3, out);
		write(Tables.move_table_edge_conjSTAGE3, out);
		write(Tables.stage4_edge_hB, out);
		write(Tables.stage4_edge_hgB, out);
		write(Tables.stage4_edge_hgA, out);
		write(Tables.symEdgeToEdgeSTAGE4, out);
		write(Tables.move_table_symEdgeSTAGE4, out);
		write(Tables.move_table_cornerSTAGE4, out);
		write(Tables.move_table_corner_conjSTAGE4, out);
		write(Tables.move_table_cenSTAGE4, out);
		write(Tables.move_table_cen_conjSTAGE4, out);
		write(Tables.move_table_cornerSTAGE5, out);
		write(Tables.move_table_corner_conjSTAGE5, out);
		write(Tables.move_table_cenSTAGE5, out);
		write(Tables.move_table_cen_conjSTAGE5, out);
		write(Tables.symEdgeToEdgeSTAGE5, out);
		write(Tables.move_table_symEdgeSTAGE5, out);

		write(CubeStage1.prune_table.ptable_packed, out);
		write(CubeStage2.prune_table_edgcen.ptable, out);
		write(CubeStage3.prune_table_cen.ptable, out);
		write(CubeStage3.prune_table_edg.ptable, out);
		write(CubeStage4.prune_table.ptable_packed, out);
		write(CubeStage5.prune_table_edgcen.ptable_packed, out);
		write(CubeStage5.prune_table_edgcor.ptable, out);
	}
	
	public static void main(String[] args) throws IOException {
		System.out.println(Arrays.toString(args));
		if(args.length != 1) {
			System.out.println("Please provide 1 argument: the file to store the tables in");
			System.exit(1);
		}
		FileOutputStream out = new FileOutputStream(args[0]);
		DataOutputStream dataOut = new DataOutputStream(out);
		initTo(dataOut);
		dataOut.close();
	}

	/**
	 * Generates a random cube.
	 * @return A random cube in the string representation. Each cube of the cube space has the same probability.
	 */
	public static CubeState randomCube() {
		Random gen = new Random();
		return randomCube(gen);
	}
	
	public static CubeState randomCube(Random r) {
		int i;
		int scramble_len = 1000;
		CubeState cube = new CubeState();

		cube.init ();
		for (i = 0; i < scramble_len; ++i) {
			cube.do_move(r.nextInt(36));
		}
		return cube;
	}
	
}
