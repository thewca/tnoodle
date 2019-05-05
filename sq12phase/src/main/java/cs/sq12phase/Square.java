package cs.sq12phase;

class Square {
    int edgeperm;       //number encoding the edge permutation 0-40319
    int cornperm;       //number encoding the corner permutation 0-40319
    boolean topEdgeFirst;   //true if top layer starts with edge left of seam
    boolean botEdgeFirst;   //true if bottom layer starts with edge right of seam
    int ml;         //shape of middle layer (+/-1, or 0 if ignored)

    static byte[] SquarePrun = new byte[40320 * 2];         //pruning table; #twists to solve corner|edge permutation

    static char[] TwistMove = new char[40320];          //transition table for twists
    static char[] TopMove = new char[40320];            //transition table for top layer turns
    static char[] BottomMove = new char[40320];         //transition table for bottom layer turns

    private static int[] fact = {1, 1, 2, 6, 24, 120, 720, 5040};

    static void set8Perm(byte[] arr, int idx) {
        int val = 0x76543210;
        for (int i=0; i<7; i++) {
            int p = fact[7-i];
            int v = idx / p;
            idx -= v*p;
            v <<= 2;
            arr[i] = (byte) ((val >> v) & 07);
            int m = (1 << v) - 1;
            val = (val & m) + ((val >> 4) & ~m);
        }
        arr[7] = (byte)val;
    }

    static char get8Perm(byte[] arr) {
        int idx = 0;
        int val = 0x76543210;
        for (int i=0; i<7; i++) {
            int v = arr[i] << 2;
            idx = (8 - i) * idx + ((val >> v) & 07);
            val -= 0x11111110 << v;
        }
        return (char)idx;
    }

    static int[][] Cnk = new int[12][12];

    static int get8Comb(byte[] arr) {
        int idx = 0, r = 4;
        for (int i=0; i<8; i++) {
            if (arr[i] >= 4) {
                idx += Cnk[7-i][r--];
            }
        }
        return idx;
    }

    static boolean inited = false;

    static void init() {
        if (inited) {
            return;
        }
        for (int i=0; i<12; i++) {
            Cnk[i][0] = 1;
            Cnk[i][i] = 1;
            for (int j=1; j<i; j++) {
                Cnk[i][j] = Cnk[i-1][j-1] + Cnk[i-1][j];
            }
        }
        byte[] pos = new byte[8];
        byte temp;

        for(int i=0;i<40320;i++){
            //twist
            set8Perm(pos, i);

            temp=pos[2];pos[2]=pos[4];pos[4]=temp;
            temp=pos[3];pos[3]=pos[5];pos[5]=temp;
            TwistMove[i]=get8Perm(pos);

            //top layer turn
            set8Perm(pos, i);
            temp=pos[0]; pos[0]=pos[1]; pos[1]=pos[2]; pos[2]=pos[3]; pos[3]=temp;
            TopMove[i]=get8Perm(pos);

            //bottom layer turn
            set8Perm(pos, i);
            temp=pos[4]; pos[4]=pos[5]; pos[5]=pos[6]; pos[6]=pos[7]; pos[7]=temp;
            BottomMove[i]=get8Perm(pos);
        }

        for (int i=0; i<40320*2; i++) {
            SquarePrun[i] = -1;
        }
        SquarePrun[0] = 0;
        int depth = 0;
        int done = 1;
        while (done < 40320 * 2) {
            boolean inv = depth >= 11;
            int find = inv ? -1 : depth;
            int check = inv ? depth : -1;
            ++depth;
            OUT:
            for (int i=0; i<40320*2; i++) {
                if (SquarePrun[i] == find) {
                    int idx = i >> 1;
                    int ml = i & 1;

                    //try twist
                    int idxx = TwistMove[idx]<<1 | (1-ml);
                    if(SquarePrun[idxx] == check) {
                        ++done;
                        SquarePrun[inv ? i : idxx] = (byte) (depth);
                        if (inv) {
                            continue OUT;
                        }
                    }

                    //try turning top layer
                    idxx = idx;
                    for(int m=0; m<4; m++) {
                        idxx = TopMove[idxx];
                        if(SquarePrun[idxx<<1|ml] == check){
                            ++done;
                            SquarePrun[inv ? i : (idxx<<1|ml)] = (byte) (depth);
                            if (inv) {
                                continue OUT;
                            }
                        }
                    }
                    assert idxx == idx;
                    //try turning bottom layer
                    for(int m=0; m<4; m++) {
                        idxx = BottomMove[idxx];
                        if(SquarePrun[idxx<<1|ml] == check){
                            ++done;
                            SquarePrun[inv ? i : (idxx<<1|ml)] = (byte) (depth);
                            if (inv) {
                                continue OUT;
                            }
                        }
                    }

                }
            }
            System.out.print(depth);
            System.out.print('\t');
            System.out.println(done);
        }
        inited = true;
    }

}
