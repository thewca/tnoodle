package cs.min2phase;

//import static cs.min2phase.CubieCube.CubieCube.CornMult;
//import static cs.min2phase.CubieCube.CubieCube.EdgeMult;
//import static cs.min2phase.CubieCube.*;
//import static cs.min2phase.Util.*;

class CoordCube {
	//phase1
	static char[][] UDSliceMove = new char[495][18];
	static char[][] TwistMove = new char[324][18];
	static char[][] FlipMove = new char[336][18];
	static char[][] UDSliceConj = new char[495][8];
	static byte[] UDSliceTwistPrun = new byte[495 * 324];
	static byte[] UDSliceFlipPrun = new byte[495 * 336];
	static byte[] TwistFlipPrun = new byte[336 * 324 * 8];
	
	//phase1to2
	static char[][] Mid3Move = new char[1320][18];
	static byte[] Mid32MPerm = new byte[24];
	static byte[] CParity = new byte[2768/8];

	//phase2
	static char[][] CPermMove = new char[2768][18];
	static char[][] EPermMove = new char[2768][10];
	static byte[][] MPermMove = new byte[24][10];
	static byte[][] MPermConj = new byte[24][16];
	static byte[] MCPermPrun = new byte[24*2768];
	static byte[] MEPermPrun = new byte[24*2768];

	static void init() {
		initCPermMove();//0
		initEPermMove();//1
		initFlipMove();//2
		initTwistMove();//3
		CubieCube.EPermR2S = null;
		CubieCube.FlipR2S = null;
		CubieCube.TwistR2S = null;

		initUDSliceMove();//4
		initUDSliceConj();//5
		
		initMid3Move();//6
		initMid32MPerm();//7
		initCParity();//8
		
		initMPermMove();//9
		initMPermConj();//10

		initTwistFlipSlicePrun();//11
		initMCEPermPrun();//12
	}
	
	static void initUDSliceMove() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		for (char i=0; i<495; i++) {
			c.setUDSlice(i);
			for (byte j=0; j<18; j++) {
				CubieCube.EdgeMult(c, CubieCube.moveCube[j], d);
				UDSliceMove[i][j] = d.getUDSlice();
			}
		}
	}
	
	static void initUDSliceConj() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		for (char i=0; i<495; i++) {
			c.setUDSlice(i);
			for (char j=0; j<16; j+=2) {
				CubieCube.EdgeConjugate(c, CubieCube.SymInv[j], d);
				UDSliceConj[i][j>>>1] = d.getUDSlice();
			}
		}
	}
	
	static void initFlipMove() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		for (char i=0; i<336; i++) {
			c.setFlip(CubieCube.FlipS2R[i]);
			for (byte j=0; j<18; j++) {
				CubieCube.EdgeMult(c, CubieCube.moveCube[j], d);
				FlipMove[i][j] = d.getFlipSym();
			}
		}	
	}
	
	static void initTwistMove() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		for (char i=0; i<324; i++) {
			c.setTwist(CubieCube.TwistS2R[i]);
			for (byte j=0; j<18; j++) {
				CubieCube.CornMult(c, CubieCube.moveCube[j], d);
				TwistMove[i][j] = d.getTwistSym();
			}
		}	
	}
	
	static void initMid3Move() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		for (char i=0; i<1320; i++) {
			c.setMid3(i);
			for (byte j=0; j<18; j++) {
				CubieCube.EdgeMult(c, CubieCube.moveCube[j], d);
				Mid3Move[i][j] = d.getMid3();
			}
		}	
	}
	
	static void initMid32MPerm() {
		CubieCube c = new CubieCube();
		for (byte i=0; i<24; i++) {
			c.setMPerm(i);
			Mid32MPerm[c.getMid3() % 24] = i;
		}
	}
	
	static void initCParity() {
		for (char i=0; i<2768; i++) {
			CParity[i>>>3] |= (Util.get8Parity(CubieCube.CPermS2R[i])) << (i & 7);
		}	
	}
	
	static void initCPermMove() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		for (char i=0; i<2768; i++) {
			CubieCube.set8Perm(c.cp, CubieCube.CPermS2R[i]);
			for (byte j=0; j<18; j++) {
				CubieCube.CornMult(c, CubieCube.moveCube[j], d);
				CPermMove[i][j] = d.getCPermSym();
			}
		}		
	}

	static void initEPermMove() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		for (char i=0; i<2768; i++) {
			CubieCube.set8Perm(c.ep, CubieCube.EPermS2R[i]);
			for (byte j=0; j<10; j++) {
				CubieCube.EdgeMult(c, CubieCube.moveCube[Util.ud2std[j]], d);
				EPermMove[i][j] = d.getEPermSym();
			}
		}		
	}

	static void initMPermMove() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		for (byte i=0; i<24; i++) {
			c.setMPerm(i);
			for (byte j=0; j<10; j++) {
				CubieCube.EdgeMult(c, CubieCube.moveCube[Util.ud2std[j]], d);
				MPermMove[i][j] = d.getMPerm();
			}
		}		
	}

	static void initMPermConj() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		for (byte i=0; i<24; i++) {
			c.setMPerm(i);
			for (byte j=0; j<16; j++) {
				CubieCube.EdgeConjugate(c, CubieCube.SymInv[j], d);
				MPermConj[i][j] = d.getMPerm();
			}
		}
	}
	
	static void initTwistFlipSlicePrun() {
		byte[] SymState = new byte[324];
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		for (int i=0; i<324; i++) {
			c.setTwist(CubieCube.TwistS2R[i]);
			for (int j=0; j<8; j++) {
				CubieCube.CornConjugate(c, j<<1, d);
				if (Util.binarySearch(CubieCube.TwistS2R, d.getTwist()) != 0xffff) {
					SymState[i] |= (1 << j);
				}
			}
		}
		byte[] SymStateF = new byte[336];
		for (int i=0; i<336; i++) {
			c.setFlip(CubieCube.FlipS2R[i]);
			for (int j=0; j<8; j++) {
				CubieCube.EdgeConjugate(c, j<<1, d);
				if (Util.binarySearch(CubieCube.FlipS2R, d.getFlip()) != 0xffff) {
					SymStateF[i] |= (1 << j);
				}
			}
		}		
		for (int i=0; i<336*324*8; i++) {
			TwistFlipPrun[i] = -1;
		}
		for (int i=0; i<8; i++) {
			TwistFlipPrun[i] = 0;
		}
		byte depth = 0;
		int done = 8;
		boolean inv;
		byte select;
		byte check;
		
		while (done < 336*324*8) {
			inv = depth > 6;
			select = inv ? -1 : depth;
			check = inv ? depth : -1;
			depth++;
			for (int i=0; i<336*324*8; i++) {
				if (TwistFlipPrun[i] != select)
					continue;
				int twist = i / 2688;
				int flip = i % 2688;
				int fsym = i & 7;
				flip >>>= 3;
				for (int m=0; m<18; m++) {
					int twistx = TwistMove[twist][m];
					int tsymx = twistx & 7;
					twistx >>>= 3;
					int flipx = FlipMove[flip][CubieCube.Sym8Move[fsym][m]];
					int fsymx = CubieCube.Sym8MultInv[CubieCube.Sym8Mult[flipx & 7][fsym]][tsymx];
					flipx >>>= 3;
					int idx = twistx * 2688 + (flipx << 3 | fsymx);
					if (TwistFlipPrun[idx] == check) {
						done++;
						if (inv) {
							TwistFlipPrun[i] = depth;
							break;
						} else {
							TwistFlipPrun[idx] = depth;
							byte sym = SymState[twistx];
							byte symF = SymStateF[flipx];
							if (sym != 1 || symF != 1) {
								for (int j=0; j<8; j++, symF >>= 1) {
									if ((symF & 1) == 1) {
										byte fsymxx = CubieCube.Sym8MultInv[fsymx][j];
										for (int k=0; k<8; k++) {
											if ((sym & (1 << k)) != 0) {
												int idxx = twistx * 2688 + (flipx << 3 | CubieCube.Sym8MultInv[fsymxx][k]);
												if (TwistFlipPrun[idxx] == -1) {
													TwistFlipPrun[idxx] = depth;
													done++;
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
//			System.out.println(String.format("%2d%10d", depth, done));
		}
		
		for (int i=0; i<495*324; i++) {
			UDSliceTwistPrun[i] = -1;
		}
		UDSliceTwistPrun[0] = 0;
		depth = 0;
		done = 1;
		while (done < 495 * 324) {
			inv = depth > 6;
			select = inv ? -1 : depth;
			check = inv ? depth : -1;
			depth++;
			for (int i=0; i<495*324; i++) {
				if (UDSliceTwistPrun[i] == select) {
					int slice = i % 495;
					int twist = i / 495;
					for (int m=0; m<18; m++) {
						int twistx = TwistMove[twist][m];
						int symx = twistx & 7;
						int slicex = UDSliceConj[UDSliceMove[slice][m]][symx];
						twistx >>>= 3;
						int idx = twistx * 495 + slicex;
						if (UDSliceTwistPrun[idx] == check) {
							done++;
							if (inv) {
								UDSliceTwistPrun[i] = depth;
								break;
							} else {
								UDSliceTwistPrun[idx] = depth;
								byte sym = SymState[twistx];
								if (sym != 1) {
									for (int j=1; j<8; j++) {
										sym >>= 1;
										if ((sym & 1) == 1) {
											int idxx = twistx * 495 + UDSliceConj[slicex][j];
											if (UDSliceTwistPrun[idxx] == -1) {
												UDSliceTwistPrun[idxx] = depth;
												done++;
											}
										}
									}
								}
							}
						}
					}
				}
			}
//			System.out.println(String.format("%2d%10d", depth, done));
		}		

		for (int i=0; i<495*336; i++) {
			UDSliceFlipPrun[i] = -1;
		}
		UDSliceFlipPrun[0] = 0;
		depth = 0;
		done = 1;
		while (done < 495 * 336) {
			inv = depth > 6;
			select = inv ? -1 : depth;
			check = inv ? depth : -1;
			depth++;
			for (int i=0; i<495*336; i++) {
				if (UDSliceFlipPrun[i] == select) {
					int slice = i % 495;
					int flip = i / 495;
					for (int m=0; m<18; m++) {
						int flipx = FlipMove[flip][m];
						int symx = flipx & 7;
						int slicex = UDSliceConj[UDSliceMove[slice][m]][symx];
						flipx >>>= 3;
						int idx = flipx * 495 + slicex;
						if (UDSliceFlipPrun[idx] == check) {
							done++;
							if (inv) {
								UDSliceFlipPrun[i] = depth;
								break;
							} else {
								UDSliceFlipPrun[idx] = depth;
								byte sym = SymStateF[flipx];
								if (sym != 1) {
									for (int j=1; j<8; j++) {
										sym >>= 1;
										if ((sym & 1) == 1) {
											int idxx = flipx * 495 + UDSliceConj[slicex][j];
											if (UDSliceFlipPrun[idxx] == -1) {
												UDSliceFlipPrun[idxx] = depth;
												done++;
											}
										}
									}
								}
							}
						}
					}
				}
			}
//			depth++;
//			System.out.println(String.format("%2d%10d", depth, done));
		}		
	}


	static void initMCEPermPrun() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		byte depth = 0;
		int done = 1;
		boolean inv;
		byte select;
		byte check;

		char[] SymState = new char[2768];
		for (int i=0; i<2768; i++) {
			CubieCube.set8Perm(c.ep, CubieCube.EPermS2R[i]);
			for (int j=1; j<16; j++) {
				CubieCube.EdgeConjugate(c, j, d);
				if (Util.binarySearch(CubieCube.EPermS2R, CubieCube.get8Perm(d.ep)) != 0xffff) {
					SymState[i] |= (1 << j);
				}
			}
		}
		for (int i=0; i<24*2768; i++) {
			MEPermPrun[i] = -1;
		}
		MEPermPrun[0] = 0;
		while (done < 24*2768) {
			inv = depth > 7;
			select = inv ? -1 : depth;
			check = inv ? depth : -1;
			depth++;
			for (int i=0; i<24*2768; i++) {
				if (MEPermPrun[i] == select) {
					int mid = i % 24;
					int edge = i / 24;
					for (int m=0; m<10; m++) {
						int edgex = EPermMove[edge][m];
						int symx = edgex & 15;
						int midx = MPermConj[MPermMove[mid][m]][symx];
						edgex >>>= 4;
						int idx = edgex * 24 + midx;
						if (MEPermPrun[idx] == check) {
							done++;
							if (inv) {
								MEPermPrun[i] = depth;
								break;
							} else {
								MEPermPrun[idx] = depth;
								char sym = SymState[edgex];
								if (sym != 0) {
									for (int j=1; j<16; j++) {
										sym >>= 1;
										if ((sym & 1) == 1) {
											int idxx = edgex * 24 + MPermConj[midx][j];
											if (MEPermPrun[idxx] == -1) {
												MEPermPrun[idxx] = depth;
												done++;
											}
										}
									}
								}
							}
						}
					}
				}
			}
//			System.out.println(String.format("%2d%10d", depth, done));
		}		
		
		for (int i=0; i<24*2768; i++) {
			MCPermPrun[i] = -1;
		}
		MCPermPrun[0] = 0;
		depth = 0;
		done = 1;
		while (done < 24*2768) {
			inv = depth > 7;
			select = inv ? -1 : depth;
			check = inv ? depth : -1;
			depth++;
			for (int i=0; i<24*2768; i++) {
				if (MCPermPrun[i] == select) {
					byte mid = (byte) (i % 24);
					char corn = (char) (i / 24);
					for (byte m=0; m<10; m++) {
						char cornx = CPermMove[corn][Util.ud2std[m]];
						byte symx = (byte) (cornx & 15);
						byte midx = MPermConj[MPermMove[mid][m]][symx];
						cornx >>>= 4;
						int idx = cornx * 24 + midx;
						if (MCPermPrun[idx] == check) {
							done++;
							if (inv) {
								MCPermPrun[i] = depth;
								break;
							} else {
								MCPermPrun[idx] = depth;
								char sym = SymState[cornx];
								if (sym != 0) {
									for (byte j=1; j<16; j++) {
										sym >>= 1;
										if ((sym & 1) == 1) {
											int idxx = cornx * 24 + MPermConj[midx][j ^ CubieCube.e2c[j]];
											if (MCPermPrun[idxx] == -1) {
												MCPermPrun[idxx] = depth;
												done++;
											}
										}
									}
								}
							}
						}
					}
				}
			}
//			System.out.println(String.format("%2d%10d", depth, done));
		}
	}	
}
