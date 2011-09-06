package org.squareone.twophase;

import java.util.Arrays;

public class Position1{
	char pos[] = new char[25];		//Actual piece positions, as a string
	int t1,t2,b1,b2;	//The half layer shapes of the topleft/right, bottomright/left
	int pm;			//The piece permutation. Is 0/1 if even/odd.
	int ml;			//The middle layer shape (0=irrelevant, +1=square, -1=kite)

	static int findhl(char[] shp, int in){
		int a;
		char[] shpcpy = new char[6];
		char[] hlcpy = new char[6];
		System.arraycopy(shp, in, shpcpy, 0, 6);
		for(a=0;a<13;a++){
			System.arraycopy(Tables.hl[a].name, 0, hlcpy, 0, 6);
			if( Arrays.equals( hlcpy, shpcpy) ) break;
		}
		return a;
	}


	//Lookup in pruning table
	public int depth(){ return ((Tables.shapeTable[t1][t2][b1][b2][pm])&127)-1; }

	//give middle layer shape
	public int getMiddle(){ return ml; }

	//return string
	public char[] strng(){return pos;}


	//convert string position to a position1 shape object.
	public void initialise(char inipos[]){
		char shape[] = new char[25];
		char prm[] = new char[17];
		int a,b;
		pos[24]=shape[24]=prm[16]=0;
		System.arraycopy(inipos, 0, pos, 0, 24);
		b=0;
		for(a=0;a<24;a++){
			prm[b++]=pos[a];
			if(pos[a]>='1' && pos[a]<='8') shape[a]='E';
			else { shape[a++]='C'; shape[a]='c'; }
		}
	
		//get half layer shapes
		t1=findhl(shape, 0);
		t2=findhl(shape, 6);
		b1=findhl(shape, 12);
		b2=findhl(shape, 18);

		//get middle layer
		ml= (inipos[24]=='-')? 1 : (inipos[24]=='/')? -1 : 0;

		//get permutation parity by counting # of inversions.
		pm=0;
		for(a=0;a<16;a++){
			for(b=a+1;b<16;b++){
				if(prm[a]>prm[b]) pm^=1;
			}
		}
	}

	//top layer turn
	public int top(){
		int c,d;
		pm= (Tables.layers[t1][t2].turnParity) ? 1-pm : pm ;
		d=Tables.layers[t1][t2].turn;
		c=t1;
		t1 =Tables.layers[t1][t2].nextLeft;
		t2=Tables.layers[c ][t2].nextRight;
		turnLayer(pos,d);
		return d;
	}

	//bottom layer turn
	public int bottom(){
		int c,d;
		char poscpy[] = new char[13];
		pm= (Tables.layers[b1][b2].turnParity) ? 1-pm : pm ;
		d=Tables.layers[b1][b2].turn;
		c=b1;
		b1=Tables.layers[b1][b2].nextLeft;
		b2=Tables.layers[c ][b2].nextRight;
		System.arraycopy( pos, 12, poscpy, 0, 13);
		turnLayer(poscpy,d);
		System.arraycopy( poscpy, 0, pos, 12, 13);
		return d;
	}

	//twist of rhs
	public void twist(){
		int b;
		pm= ((Tables.shapeTable[t1][t2][b1][b2][0]&128) != 0) ? 1-pm : pm ;
		b=t2;t2=b1;b1=b;ml=-ml;
		twistLayers();
	}

	private void turnLayer(char[] ps, int d){
		char c;
		switch(d){
		case 1:
			     c=ps[11]; ps[11]=ps[10]; ps[10]=ps[ 9]; ps[ 9]=ps[ 8];
			ps[ 8]=ps[ 7]; ps[ 7]=ps[ 6]; ps[ 6]=ps[ 5]; ps[ 5]=ps[ 4];
			ps[ 4]=ps[ 3]; ps[ 3]=ps[ 2]; ps[ 2]=ps[ 1]; ps[ 1]=ps[ 0]; ps[ 0]=c;
			break;
		case 2:
			c=ps[11]; ps[11]=ps[ 9]; ps[ 9]=ps[ 7]; ps[ 7]=ps[ 5]; ps[ 5]=ps[ 3]; ps[ 3]=ps[ 1]; ps[ 1]=c;
			c=ps[10]; ps[10]=ps[ 8]; ps[ 8]=ps[ 6]; ps[ 6]=ps[ 4]; ps[ 4]=ps[ 2]; ps[ 2]=ps[ 0]; ps[ 0]=c;
			break;
		case 3:
			c=ps[11]; ps[11]=ps[ 8]; ps[ 8]=ps[ 5]; ps[ 5]=ps[ 2]; ps[ 2]=c;
			c=ps[10]; ps[10]=ps[ 7]; ps[ 7]=ps[ 4]; ps[ 4]=ps[ 1]; ps[ 1]=c;
			c=ps[ 9]; ps[ 9]=ps[ 6]; ps[ 6]=ps[ 3]; ps[ 3]=ps[ 0]; ps[ 0]=c;
			break;
		case 4:
			c=ps[11]; ps[11]=ps[ 7]; ps[ 7]=ps[ 3]; ps[ 3]=c;
			c=ps[10]; ps[10]=ps[ 6]; ps[ 6]=ps[ 2]; ps[ 2]=c;
			c=ps[ 9]; ps[ 9]=ps[ 5]; ps[ 5]=ps[ 1]; ps[ 1]=c;
			c=ps[ 8]; ps[ 8]=ps[ 4]; ps[ 4]=ps[ 0]; ps[ 0]=c;
			break;
		case 5:
			     c=ps[11]; ps[11]=ps[ 6]; ps[ 6]=ps[ 1]; ps[ 1]=ps[ 8];
			ps[ 8]=ps[ 3]; ps[ 3]=ps[10]; ps[10]=ps[ 5]; ps[ 5]=ps[ 0];
			ps[ 0]=ps[ 7]; ps[ 7]=ps[ 2]; ps[ 2]=ps[ 9]; ps[ 9]=ps[ 4]; ps[ 4]=c;
			break;
		case 6:
			c=ps[11]; ps[11]=ps[ 5]; ps[ 5]=c;
			c=ps[10]; ps[10]=ps[ 4]; ps[ 4]=c;
			c=ps[ 9]; ps[ 9]=ps[ 3]; ps[ 3]=c;
			c=ps[ 8]; ps[ 8]=ps[ 2]; ps[ 2]=c;
			c=ps[ 7]; ps[ 7]=ps[ 1]; ps[ 1]=c;
			c=ps[ 6]; ps[ 6]=ps[ 0]; ps[ 0]=c;
			break;
		case 7:
			     c=ps[11]; ps[11]=ps[ 4]; ps[ 4]=ps[ 9]; ps[ 9]=ps[ 2];
			ps[ 2]=ps[ 7]; ps[ 7]=ps[ 0]; ps[ 0]=ps[ 5]; ps[ 5]=ps[10];
			ps[10]=ps[ 3]; ps[ 3]=ps[ 8]; ps[ 8]=ps[ 1]; ps[ 1]=ps[ 6]; ps[ 6]=c;
			break;
		case 8:
			c=ps[11]; ps[11]=ps[ 3]; ps[ 3]=ps[ 7]; ps[ 7]=c;
			c=ps[10]; ps[10]=ps[ 2]; ps[ 2]=ps[ 6]; ps[ 6]=c;
			c=ps[ 9]; ps[ 9]=ps[ 1]; ps[ 1]=ps[ 5]; ps[ 5]=c;
			c=ps[ 8]; ps[ 8]=ps[ 0]; ps[ 0]=ps[ 4]; ps[ 4]=c;
			break;
		case 9:
			c=ps[11]; ps[11]=ps[ 2]; ps[ 2]=ps[ 5]; ps[ 5]=ps[ 8]; ps[ 8]=c;
			c=ps[10]; ps[10]=ps[ 1]; ps[ 1]=ps[ 4]; ps[ 4]=ps[ 7]; ps[ 7]=c;
			c=ps[ 9]; ps[ 9]=ps[ 0]; ps[ 0]=ps[ 3]; ps[ 3]=ps[ 6]; ps[ 6]=c;
			break;
		case 10:
			c=ps[11]; ps[11]=ps[ 1]; ps[ 1]=ps[ 3]; ps[ 3]=ps[ 5]; ps[ 5]=ps[ 7]; ps[ 7]=ps[ 9]; ps[ 9]=c;
			c=ps[10]; ps[10]=ps[ 0]; ps[ 0]=ps[ 2]; ps[ 2]=ps[ 4]; ps[ 4]=ps[ 6]; ps[ 6]=ps[ 8]; ps[ 8]=c;
			break;
		case 11:
			     c=ps[ 0]; ps[ 0]=ps[ 1]; ps[ 1]=ps[ 2]; ps[ 2]=ps[ 3];
			ps[ 3]=ps[ 4]; ps[ 4]=ps[ 5]; ps[ 5]=ps[ 6]; ps[ 6]=ps[ 7];
			ps[ 7]=ps[ 8]; ps[ 8]=ps[ 9]; ps[ 9]=ps[10]; ps[10]=ps[11]; ps[11]=c;
			break;
		}
	}

	private void twistLayers(){
		char c;
		c=pos[11]; pos[11]=pos[17]; pos[17]=c;
		c=pos[10]; pos[10]=pos[16]; pos[16]=c;
		c=pos[ 9]; pos[ 9]=pos[15]; pos[15]=c;
		c=pos[ 8]; pos[ 8]=pos[14]; pos[14]=c;
		c=pos[ 7]; pos[ 7]=pos[13]; pos[13]=c;
		c=pos[ 6]; pos[ 6]=pos[12]; pos[12]=c;
	}
}
