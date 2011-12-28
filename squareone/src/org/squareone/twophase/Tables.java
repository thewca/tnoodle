package org.squareone.twophase;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.logging.Logger;

import net.gnehzr.tnoodle.utils.TimedLogRecordStart;
import net.gnehzr.tnoodle.utils.Utils;

public class Tables {
	private static final Logger l = Logger.getLogger(Tables.class.getName());

	public static HalfLayer hl[] = new HalfLayer[13];			//the 13 possible half layers
	public static Layer layers[][] = new Layer[13][13];			//the 13^2 theoretically possible layers made of two halves
										//  It also holds transition data for layer turns
	public static byte shapeTable[][][][][] = new byte[13][13][13][13][2];	//pruning table; gods algorithm for shape+parity
										//It holds length of position till even parity cube.
										//the high bit is set if a twist changes parity.
	public static byte permTable[][] = new byte[2][40320];			//pruning table; #twists to solve corner|edge permutation
	public static int permTwistTable[] = new int[40320];			//transition table for twists
	public static int permTopTable[] = new int[40320];			//transition table for top layer turns
	public static int permBotTable[] = new int[40320];			//transition table for bottom layer turns

	/***************************************************
	*           Initialization functions               *
	***************************************************/

	public static void initialise() { initLayers(); initShapeTable(); initPermTable(); }

	public static void initLayers(){
		TimedLogRecordStart start = new TimedLogRecordStart("initializing layers");
		l.log(start);

		int a,b,c,d,t;

		//Construct the 13 possible half layers

		Tables.hl[0] = new HalfLayer( "EEEEEE".toCharArray(),"123450".toCharArray());

		Tables.hl[1] = new HalfLayer( "CcEEEE".toCharArray(), "12340".toCharArray());
		Tables.hl[2] = new HalfLayer( "ECcEEE".toCharArray(), "12350".toCharArray());
		Tables.hl[3] = new HalfLayer( "EECcEE".toCharArray(), "12450".toCharArray());
		Tables.hl[4] = new HalfLayer( "EEECcE".toCharArray(), "13450".toCharArray());
		Tables.hl[5] = new HalfLayer( "EEEECc".toCharArray(), "23450".toCharArray());

		Tables.hl[6] = new HalfLayer( "CcCcEE".toCharArray(), "1240".toCharArray());
		Tables.hl[7] = new HalfLayer( "CcECcE".toCharArray(), "1340".toCharArray());
		Tables.hl[8] = new HalfLayer( "CcEECc".toCharArray(), "2340".toCharArray());
		Tables.hl[9] = new HalfLayer( "ECcCcE".toCharArray(), "1350".toCharArray());
		Tables.hl[10] = new HalfLayer("ECcECc".toCharArray(), "2350".toCharArray());
		Tables.hl[11] = new HalfLayer("EECcCc".toCharArray(), "2450".toCharArray());

		Tables.hl[12] = new HalfLayer("CcCcCc".toCharArray(), "240".toCharArray());

		//combine halves to make the 13*13 possible layers
		for(a=0;a<13;a++){
			for(b=0;b<13;b++){
				Tables.layers[a][b] = new Layer(Tables.hl[a],Tables.hl[b]);
			}
		}

		//For each layer, find next layer shape when turned clockwise,
		// where NextLeft and NextRight are the two new halves.
		char nm[] = new char[13];
		nm[12]=0;
		//now construct transition tables.
		for(a=0;a<13;a++){
			for(b=0;b<13;b++){
				//Construct name of turned layer
				t=Tables.layers[a][b].turn;
				for(c=0; c<t; c++) nm[c]=Tables.layers[a][b].name[c+12-t];
				for(c=t; c<12;c++) nm[c]=Tables.layers[a][b].name[c   -t];
				//find turned layer in layerlist
				for(c=0;c<13;c++){
					for(d=0;d<13;d++){
						if(Tables.layers[c][d].equals(nm)){
							Tables.layers[a][b].nextLeft=c;
							Tables.layers[a][b].nextRight=d;
							c=13; break;
						}
					}
				}
			}
		}
		
		l.log(start.finishedNow());
	}


	public static void initShapeTable(){
		TimedLogRecordStart start = new TimedLogRecordStart("initializing shape table");
		l.log(start);

		int a,b,c,d,e, i, a2,b2,c2,d2,e2, t;
		int lInt;

		// set twist parity changes
		for(a=0;a<13;a++)for(b=0;b<13;b++)for(c=0;c<13;c++)for(d=0;d<13;d++){
			Tables.shapeTable[a][b][c][d][0] = Tables.shapeTable[a][b][c][d][1] = 0;
		}
		for(b=0;b<13;b++){
			if((Tables.hl[b].pieces&1) != 0){
				for(c=0;c<13;c++){
					if((Tables.hl[c].pieces&1) != 0){
						for(a=0;a<13;a++)for(d=0;d<13;d++){
							Tables.shapeTable[a][b][c][d][0] = Tables.shapeTable[a][b][c][d][1] = (byte)128;
						}
					}
				}
			}
		}

		//build pruning table
		Tables.shapeTable[7 ][7 ][10][10][0] = 1;
		Tables.shapeTable[10][10][7 ][7 ][0] = 1;
		Tables.shapeTable[7 ][7 ][7 ][7 ][1] = 1;
		Tables.shapeTable[10][10][10][10][1] = 1;

		lInt=0;
		do{
			lInt++; i=0;
			for(a=0;a<13;a++)for(b=0;b<13;b++)for(c=0;c<13;c++)for(d=0;d<13;d++)for(e=0;e<2;e++){
				if((Tables.shapeTable[a][b][c][d][e]&127)==lInt){
					//try twist
					e2= ((Tables.shapeTable[a][b][c][d][e]&128) != 0) ? 1-e : e ;
					if( (Tables.shapeTable[a][c][b][d][e2]&127) == 0){
						i++;
						Tables.shapeTable[a][c][b][d][e2]+=lInt+1;
					}

					//try turning top layer
					a2=a;b2=b;e2=e;
					do{
						e2= (Tables.layers[a2][b2].turnParity) ? 1-e2 : e2 ;
						t=a2;
						a2=Tables.layers[a2][b2].nextLeft;
						b2=Tables.layers[t ][b2].nextRight;

						if( (Tables.shapeTable[a2][b2][c][d][e2]&127) == 0){
							i++;
							Tables.shapeTable[a2][b2][c][d][e2]+=lInt+1;
						}
					}while((a2!=a) || (b2!=b));


					//try turning bottom layer
					c2=c;d2=d;e2=e;
					do{
						e2= (Tables.layers[c2][d2].turnParity) ? 1-e2 : e2 ;
						t=c2;
						c2=Tables.layers[c2][d2].nextLeft;
						d2=Tables.layers[t ][d2].nextRight;

						if( (Tables.shapeTable[a][b][c2][d2][e2]&127) == 0){
							i++;
							Tables.shapeTable[a][b][c2][d2][e2]+=lInt+1;
						}
					}while(c2!=c || d2!=d);
				}
			}
		} while(i != 0);
		
		l.log(start.finishedNow());
	}


	public static void initPermTable(){
		TimedLogRecordStart start = new TimedLogRecordStart("initializing PermTable");
		l.log(start);

		int a,b,i;
		int t,c,lInt;
		char t2;
		char pos[] = new char[9];

		//clear perm tables
		for(a=0;a<40320;a++){
			Tables.permTable[0][a]=Tables.permTable[1][a]=0;
			Tables.permTwistTable[a]=0;
			Tables.permBotTable[a]=0;
			Tables.permTopTable[a]=0;
		}

		//build transition tables
		for(a=0;a<40320;a++){
			//twist
			Perm.num2Perm(pos, 'A', a, 8);
			t2=pos[2];pos[2]=pos[4]; pos[4]=t2;
			t2=pos[3];pos[3]=pos[5]; pos[5]=t2;
			Tables.permTwistTable[a]=Perm.perm2Num(pos,8);
	
			//top layer turn
			Perm.num2Perm(pos, 'A', a, 8);
			t2=pos[3]; pos[3]=pos[2]; pos[2]=pos[1]; pos[1]=pos[0]; pos[0]=t2;
			Tables.permTopTable[a]=Perm.perm2Num(pos,8);

			//bottom layer turn
			Perm.num2Perm(pos, 'A', a, 8);
			t2=pos[7]; pos[7]=pos[6]; pos[6]=pos[5]; pos[5]=pos[4]; pos[4]=t2;
			Tables.permBotTable[a]=Perm.perm2Num(pos,8);
		}

		//build perm table
		Tables.permTable[0][0]=1;
		lInt=0;
		do{
			lInt++; i=0;
			for(a=0;a<40320;a++) for(t=0;t<2;t++){
				if(Tables.permTable[t][a]==lInt){
					//try twist
					b= Tables.permTwistTable[a];
					if( Tables.permTable[1-t][b] == 0 ){
						i++;
						Tables.permTable[1-t][b]=(byte)(lInt+1);
					}

					//try turning top layer
					b=a;
					for(c=0;c<4;c++){
						b= Tables.permTopTable[b];
						if( Tables.permTable[t][b] == 0 ){
							i++;
							Tables.permTable[t][b]=(byte)(lInt+1);
						}
					}

					//try turning bottom layer
					b=a;
					for(c=0;c<4;c++){
						b= Tables.permBotTable[b];
						if( Tables.permTable[t][b] == 0 ){
							i++;
							Tables.permTable[t][b]=(byte)(lInt+1);
						}
					}
				}
			}
		}while(i != 0);
		
		l.log(start.finishedNow());
	}


	/*********************************************************
	*     Save lookup tables (based on jcubeexplorer code)   *
	**********************************************************/

	private static boolean inited = false;
	public static void init() {
		if(inited)
			return;
		
		TimedLogRecordStart start = new TimedLogRecordStart("initing tables");
		l.log(start);
		
		try {
			FileInputStream is = new FileInputStream(new File(Utils.getResourceDirectory(), "squareone_tables"));
			inited = loadTables(new DataInputStream(is));
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		if(!inited) {
			initialise();
		}
		inited = true;
		
		l.log(start.finishedNow());
	}

	private static boolean loadTables(InputStream in) {
		boolean success = loadTransitionTables(in) && loadShapeTable(in) && loadPermTable(in);
		try {
			in.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return success;
	}
	
	private static boolean loadTransitionTables(InputStream in) {
		try {
			TimedLogRecordStart start = new TimedLogRecordStart("loading transition tables");
			l.log(start);
			
			byte[] buff = new byte[transition_tables_bytes];
			int read = 0;
			while(read < buff.length)
				read += in.read(buff, read, buff.length-read);

			int index = 0;
			for(int[] table : transition_tables) {
				for(int i=0; i<table.length; i++) {
					table[i] = (int)(((buff[index++]&0xFF) << 24) | ((buff[index++]&0xFF) << 16) | ((buff[index++]&0xFF) << 8) | ((buff[index++]&0xFF)));
				}
			}
			
			l.log(start.finishedNow());
			return true;
		} catch(Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	private static boolean loadShapeTable(InputStream in) {
		try {
			TimedLogRecordStart start = new TimedLogRecordStart("loading shape table");
			l.log(start);

			for(int i=0;i<13;i++)
				for(int j=0;j<13;j++)
					for(int k=0;k<13;k++)
						for(int l=0;l<13;l++)
							in.read(shapeTable[i][j][k][l], 0, 2);

			l.log(start.finishedNow());
			return true;
		} catch(Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	private static boolean loadPermTable(InputStream in) {
		try {
			TimedLogRecordStart start = new TimedLogRecordStart("loading perm table");
			l.log(start);

			for(int i=0;i<2;i++) {
				int read = 0;
				while(read < 40320)
					read += in.read(permTable[i], read, 40320-read);
			}

			l.log(start.finishedNow());
			return true;
		} catch(Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	

	public static void main(String[] args) throws IOException {
		System.out.println(Arrays.toString(args));
		if(args.length != 1) {
			System.out.println("Please provide 1 argument: the file to store the tables in");
			System.exit(1);
		}
		initialise();
		FileOutputStream out = new FileOutputStream(args[0]);
		dumpTransitionTables(out);
		dumpShapeTable(out);
		dumpPermTable(out);
		out.close();
	}
	
	private static void dumpTransitionTables(OutputStream out) throws IOException {
		TimedLogRecordStart start = new TimedLogRecordStart("dumping transition tables");
		l.log(start);

		byte[] buff = new byte[transition_tables_bytes];
		int index = 0;
		for(int[] table : transition_tables) {
			for(int i=0; i<table.length; i++) {
				buff[index++] = (byte) ((table[i] >> 24) & 0xFF);
				buff[index++] = (byte) ((table[i] >> 16) & 0xFF);
				buff[index++] = (byte) ((table[i] >> 8) & 0xFF);
				buff[index++] = (byte) (table[i] & 0xFF);
			}
		}
		out.write(buff);

		l.log(start.finishedNow());
	}
	
	private static void dumpShapeTable(OutputStream out) throws IOException {
		TimedLogRecordStart start = new TimedLogRecordStart("dumping shape table");
		l.log(start);

		for(int i=0;i<13;i++)
			for(int j=0;j<13;j++)
				for(int k=0;k<13;k++)
					for(int l=0;l<13;l++)
						out.write(shapeTable[i][j][k][l]);

		l.log(start.finishedNow());
	}

	private static void dumpPermTable(OutputStream out) throws IOException {
		TimedLogRecordStart start = new TimedLogRecordStart("dumping perm table");
		l.log(start);

		out.write(permTable[0]);
		out.write(permTable[1]);

		l.log(start.finishedNow());
	}

	private static final int[][] transition_tables = new int[][] {
		permTwistTable, permTopTable, permBotTable };
	private static int transition_tables_bytes = 0;
	static {
		for(int[] table : transition_tables)
			transition_tables_bytes += table.length * 4;
	}
}
