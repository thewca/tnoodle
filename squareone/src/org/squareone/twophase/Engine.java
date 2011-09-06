package org.squareone.twophase;

import java.io.PrintStream;
import java.io.ByteArrayOutputStream;

public class Engine {

	protected Position1 initPos;			//Position that engine is to solve.
	protected int maxDepth;				//Maximum depth; given at start, or length of last soln found
	protected MoveList moves = new MoveList();	//List of moves done so far
	protected int length1, length2;			//Current max length of search
	protected long nodes1, nodes1Low, nodes2;	//Number of nodes visited in latest search
	protected long tStart;				//Time for the start of the search
	protected long timeOut;				//Time out
	protected String solution;			//Solution

	/***************************************************
	*       Phase 1 Search algorithm functions         *
	***************************************************/

	//control a phase 1 search
	private String startPhase1(){
		//first extract the starting shape
		Position1 p1=initPos;
		//Perform phase 1 search, for increasing depths
		nodes2=nodes1=0;
		nodes1Low=0;

		// Treat empty phase1 separately; phase1 is empty or ends in a twist.
		length1=0;
		if(p1.depth()==0) startPhase2(p1,-1);	
		for(length1=1;  length1<=maxDepth; length1++)
			phase1(p1, length1, -1);
		return solution;
	}


	//Perform phase 1 search on given position
	//l1=#moves still to be done, lm=last move done
	private int phase1(Position1 ps1, int l1, int lm){

		int c;
		int r=0;
		// prune 
		int l=ps1.depth();
		if( l > l1) return 0;

		nodes1Low++;
		if( nodes1Low>=100000 ){
			if (System.currentTimeMillis() - tStart > timeOut << 10) return 0;
			nodes1Low=0;
			nodes1++;
			System.out.print("Len1: " + (int)length1 + "  Nodes1:" + nodes1);
			if(nodes1 != 0) System.out.print("00000");
			System.out.print("  Len2: " + (int)(maxDepth-length1) + "  Nodes2:" + nodes2 + "    \r");
			System.out.flush();
		}

		if(l==0){
			if(l1==0){
				//Found a solution to phase 1; Only do it if ended on a twist
				if(lm==0) return startPhase2(ps1,lm);
				else return 0;
			}else if( l1<4 ) return 0;	//return if too few moves to escape cube shape
		}


		//try each possible move. First twist;
		if(lm!=0){
			ps1.twist();
			moves.push(0);
			r+=phase1(ps1,l1-1,0);
			if( r != 0 ) return r;
			moves.pull();
			ps1.twist();
		}

		//Try top layer
		if(lm!=1 && lm!=2){
			c=0;
			do{
				c+= ps1.top();
				if(c>=12) break;
				moves.push(c);
				r+=phase1(ps1,l1-1,1);
				if( r != 0 ) return r;
				moves.pull();
			}while(true);
		}

		//Try bottom layer
		if(lm!=2){
			c=0;
			do{
				c+= ps1.bottom();
				if(c>=12) break;
				moves.push(-c);
				r+=phase1(ps1,l1-1,2);
				if( r != 0 ) return r;
				moves.pull();
			}while(true);
		}

		return r;
	}

	/***************************************************
	*       Phase 2 Search algorithm functions         *
	***************************************************/


	//control a phase 2 search
	private int startPhase2(Position1 ps1, int lm){

		//first extract the starting position
		Position2 p2 = new Position2();
		p2.initialise(ps1);

		//Perform phase 2 search, for increasing depths
		int r;
		for(r=0, length2=0; length2<=maxDepth-length1 && r==0; length2++)
			r=phase2(p2, length2, lm);
		if(( r != 0 ))
			if(maxDepth>length1 || maxDepth==length1)
				r=0;	//if phase2 is still significant, then must continue search
		return r;
	}


	//Perform phase 2 search on given position of given depth
	private int phase2(Position2 ps2, int l2, int lm){
		int c;
		int r=0;
		// prune
		int l =ps2.depth();
		if( l > l2) return 0;

		nodes2++;
		if( (nodes2&65535)==0 ){
			System.out.print("Len1: " + (int)length1 + "  Nodes1:" + nodes1);
			if(( nodes1 != 0 )) System.out.print("00000");
			System.out.print("  Len2: " + (int)(maxDepth-length1) + "  Nodes2:" + nodes2 + "    \r");
			System.out.flush();
		}

		if(l2==0 && l==0){
			//Found a solution to phase 2;
			if( ps2.isSolved() ){
				foundSol( moves.length(), false );
				return 1;
			}else return 0;
		}

		//try each possible move. First twist;
		if(lm!=0){
			if(ps2.canTwist()){
				ps2.twist();
				moves.push(0);
				r+=phase2(ps2,l2-1,0);
				moves.pull();
				if( r != 0 ) return r;
				ps2.twist();
			}
		}

		//Try top layer
		if(lm!=1 && lm!=2){
			c=0;
			do{
				c+= ps2.top();
				if(c>=12) break;
				moves.push(c);
				r+=phase2(ps2,l2-1,1);
				moves.pull();
				if( r != 0 ) return r;
			}while(true);
		}

		//Try bottom layer
		if(lm!=2){
			c=0;
			do{
				c+= ps2.bottom();
				if(c>=12) break;
				moves.push(-c);
				r+=phase2(ps2,l2-1,2);
				moves.pull();
				if(r != 0 ) return r;
			}while(true);
		}

		return r;
	}



	/***************************************************
	*            Search algorithm functions            *
	***************************************************/

	public String doSearch(Position1 p1, int dp, long tOut){
		initPos=p1;
		maxDepth=dp;
		tStart=System.currentTimeMillis();
		timeOut=tOut;
		return startPhase1();
	}



	/***************************************************
	*       Output routine                             *
	***************************************************/

	protected void foundSol(int l, boolean large){
		//clear line
		System.out.print("                                                                               \r");
		System.out.println("Length:" + l);

		maxDepth=large? l-2: l-1;

		System.out.print("Solution: ");
		moves.print(System.out);
		System.out.println("");
		
		System.out.print("Scramble: ");
		moves.printGen(System.out);
		System.out.println("");

		ByteArrayOutputStream out = new ByteArrayOutputStream();
		moves.printGen(new PrintStream(out));
		solution = out.toString();

		tStart -= (timeOut * 1000); //Basically, just stop the search.
	}

}
