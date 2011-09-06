package org.squareone.twophase;

import java.lang.Math;

class Position2{
	int edgeperm;		//number encoding the edge permutation 0-40319
	int cornperm;		//number encoding the corner permutation 0-40319
	boolean topEdgeFirst;	//true if top layer starts with edge left of seam
	boolean botEdgeFirst;	//true if bottom layer starts with edge right of seam
	int ml;			//shape of middle layer (+/-1, or 0 if ignored)

	//give middle layer shape
	public int getMiddle(){ return ml; }

	//Lookup in pruning table
	public int depth(){
		int l1,l2;
		switch(ml){
		case 1:
			l1=Tables.permTable[0][edgeperm];
			l2=Tables.permTable[0][cornperm];
			break;
		case 0:
			l1=Math.min(Tables.permTable[0][edgeperm],Tables.permTable[1][edgeperm]);
			l2=Math.min(Tables.permTable[0][cornperm],Tables.permTable[1][cornperm]);
			break;
		default:
			l1=Tables.permTable[1][edgeperm];
			l2=Tables.permTable[1][cornperm];
			break;
		}
		return Math.max(l1,l2)-1;
	}

	// Moves allowed
	//Do top layer turn.
	public int top(){
		topEdgeFirst=!topEdgeFirst;
		if(topEdgeFirst) { edgeperm=Tables.permTopTable[edgeperm]; return 1;}
		else { cornperm=Tables.permTopTable[cornperm]; return 2;}
	}
	//Do bottom layer turn.
	public int bottom(){
		botEdgeFirst=!botEdgeFirst;
		if(botEdgeFirst) { edgeperm=Tables.permBotTable[edgeperm]; return 1;}
		else { cornperm=Tables.permBotTable[cornperm]; return 2;}
	}
	//Do twist
	public void twist(){
		edgeperm=Tables.permTwistTable[edgeperm];
		cornperm=Tables.permTwistTable[cornperm];
		ml=-ml;
	}
	//Check if can twist while keeping square layers
	public boolean canTwist(){
		return topEdgeFirst==botEdgeFirst;
	}
	
	//Check if solved
	public boolean isSolved(){
		return (edgeperm==0 && cornperm==0 && topEdgeFirst==false && botEdgeFirst==true && ml>=0);
	}


	//convert string position to a position1 shape object.
	public void initialise(Position1 p1){
		char prm[] = new char[9];
		int a,b;
		char[] inipos=p1.strng();
		prm[8]=0;

		ml=p1.getMiddle();

		//Strip out corners
		for(a=0;a<8;a++) prm[a]=inipos[a*3+1];
		//convert to number
		cornperm=Perm.perm2Num(prm,8);

		//Strip top layer edges
		if(inipos[0]==inipos[1]){ a=2; topEdgeFirst=false; }
		else{ a=0; topEdgeFirst=true;  }
		for(b=0; b<4; a+=3, b++) prm[b]=inipos[a];
		if(inipos[12]==inipos[13]){ a=14; botEdgeFirst=false; }
		else{ a=12; botEdgeFirst=true;  }
		for( ; b<8; a+=3, b++) prm[b]=inipos[a];
		edgeperm=Perm.perm2Num(prm,8);
	}
}
