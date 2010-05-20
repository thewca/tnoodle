package org.kociemba.twophase;

import static org.kociemba.twophase.Facelet.*;
import static org.kociemba.twophase.Color.*;
import static org.kociemba.twophase.Corner.*;
import static org.kociemba.twophase.Edge.*;

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Cube on the facelet level
class FaceCube {
	public Color[] f = new Color[54];

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Map the corner positions to facelet positions. cornerFacelet[URF.ordinal()][0] e.g. gives the position of the
	// facelet in the URF corner position, which defines the orientation.<br>
	// cornerFacelet[URF.ordinal()][1] and cornerFacelet[URF.ordinal()][2] give the position of the other two facelets
	// of the URF corner (clockwise).
	final static Facelet[][] cornerFacelet = { { U9, R1, F3 }, { U7, F1, L3 }, { U1, L1, B3 }, { U3, B1, R3 },
			{ D3, F9, R7 }, { D1, L9, F7 }, { D7, B9, L7 }, { D9, R9, B7 } };

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Map the edge positions to facelet positions. edgeFacelet[UR.ordinal()][0] e.g. gives the position of the facelet in
	// the UR edge position, which defines the orientation.<br>
	// edgeFacelet[UR.ordinal()][1] gives the position of the other facelet
	final static Facelet[][] edgeFacelet = { { U6, R2 }, { U8, F2 }, { U4, L2 }, { U2, B2 }, { D6, R8 }, { D2, F8 },
			{ D4, L8 }, { D8, B8 }, { F6, R4 }, { F4, L6 }, { B6, L4 }, { B4, R6 } };

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Map the corner positions to facelet colors.
	final static Color[][] cornerColor = { { U, R, F }, { U, F, L }, { U, L, B }, { U, B, R }, { D, F, R }, { D, L, F },
			{ D, B, L }, { D, R, B } };

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Map the edge positions to facelet colors.
	final static Color[][] edgeColor = { { U, R }, { U, F }, { U, L }, { U, B }, { D, R }, { D, F }, { D, L }, { D, B },
			{ F, R }, { F, L }, { B, L }, { B, R } };

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	FaceCube() {
		String s = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";
		for (int i = 0; i < 54; i++)
			f[i] = Color.valueOf(s.substring(i, i + 1));

	}

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Construct a facelet cube from a string
	FaceCube(String cubeString) {
		for (int i = 0; i < cubeString.length(); i++)
			f[i] = Color.valueOf(cubeString.substring(i, i + 1));
	}

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Gives string representation of a facelet cube
	String to_String() {
		String s = "";
		for (int i = 0; i < 54; i++)
			s += f[i].toString();
		return s;
	}

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Gives CubieCube representation of a faceletcube
	CubieCube toCubieCube() {
		byte ori;
		CubieCube ccRet = new CubieCube();
		for (int i = 0; i < 8; i++)
			ccRet.cp[i] = URF;// invalidate corners
		for (int i = 0; i < 12; i++)
			ccRet.ep[i] = UR;// and edges
		Color col1, col2;
		for (Corner i : Corner.values()) {
			// get the colors of the cubie at corner i, starting with U/D
			for (ori = 0; ori < 3; ori++)
				if (f[cornerFacelet[i.ordinal()][ori].ordinal()] == U || f[cornerFacelet[i.ordinal()][ori].ordinal()] == D)
					break;
			col1 = f[cornerFacelet[i.ordinal()][(ori + 1) % 3].ordinal()];
			col2 = f[cornerFacelet[i.ordinal()][(ori + 2) % 3].ordinal()];

			for (Corner j : Corner.values()) {
				if (col1 == cornerColor[j.ordinal()][1] && col2 == cornerColor[j.ordinal()][2]) {
					// in cornerposition i we have cornercubie j
					ccRet.cp[i.ordinal()] = j;
					ccRet.co[i.ordinal()] = (byte) (ori % 3);
					break;
				}
			}
		}
		for (Edge i : Edge.values())
			for (Edge j : Edge.values()) {
				if (f[edgeFacelet[i.ordinal()][0].ordinal()] == edgeColor[j.ordinal()][0]
						&& f[edgeFacelet[i.ordinal()][1].ordinal()] == edgeColor[j.ordinal()][1]) {
					ccRet.ep[i.ordinal()] = j;
					ccRet.eo[i.ordinal()] = 0;
					break;
				}
				if (f[edgeFacelet[i.ordinal()][0].ordinal()] == edgeColor[j.ordinal()][1]
						&& f[edgeFacelet[i.ordinal()][1].ordinal()] == edgeColor[j.ordinal()][0]) {
					ccRet.ep[i.ordinal()] = j;
					ccRet.eo[i.ordinal()] = 1;
					break;
				}
			}
		return ccRet;
	};
}
