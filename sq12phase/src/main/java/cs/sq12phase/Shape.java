package cs.sq12phase;

import java.util.Arrays;

class Shape {

    //1 = corner, 0 = edge.
    static int[] halflayer = {0x00, 0x03, 0x06, 0x0c, 0x0f, 0x18, 0x1b, 0x1e,
        0x30, 0x33, 0x36, 0x3c, 0x3f};

    static int[] ShapeIdx = new int[3678];
    static int[] ShapePrun = new int[3768 * 2];
    static int[] ShapePrunOpt = new int[3768 * 2];

    static int[] TopMove = new int[3678 * 2];
    static int[] BottomMove = new int[3678 * 2];
    static int[] TwistMove = new int[3678 * 2];

    private Shape(){}

    int top;
    int bottom;
    int parity;

    static int getShape2Idx(int shp) {
        int ret = Arrays.binarySearch(ShapeIdx, shp & 0xffffff)<<1 | shp>>24;
        return ret;
    }

    int getIdx() {
        int ret = Arrays.binarySearch(ShapeIdx, top<<12|bottom)<<1|parity;
        return ret;
    }

    void setIdx(int idx) {
        parity = idx & 1;
        top = ShapeIdx[idx >> 1];
        bottom = top & 0xfff;
        top >>= 12;
    }

    int topMove() {
        int move = 0;
        int moveParity = 0;
        do {
            if ((top & 0x800) == 0) {
                move += 1;
                top = top << 1;
            } else {
                move += 2;
                top = (top << 2) ^ 0x3003;
            }
            moveParity = 1 - moveParity;
        } while ((Integer.bitCount(top & 0x3f) & 1) != 0);
        if ((Integer.bitCount(top)&2)==0) {
            parity ^= moveParity;
        }
        return move;
    }

    int bottomMove() {
        int move = 0;
        int moveParity = 0;
        do {
            if ((bottom & 0x800) == 0) {
                move +=1;
                bottom = bottom << 1;
            } else {
                move +=2;
                bottom = (bottom << 2) ^ 0x3003;
            }
            moveParity = 1 - moveParity;
        } while ((Integer.bitCount(bottom & 0x3f) & 1) != 0);
        if ((Integer.bitCount(bottom)&2)==0) {
            parity ^= moveParity;
        }
        return move;
    }

    void twistMove() {
        int temp = top & 0x3f;
        int p1 = Integer.bitCount(temp);
        int p3 = Integer.bitCount(bottom&0xfc0);
        parity ^= 1 & ((p1&p3)>>1);

        top = (top & 0xfc0) | ((bottom >> 6) & 0x3f);
        bottom = (bottom & 0x3f) | temp << 6;
    }

    static boolean inited = false;

    static void init() {
        if (inited) {
            return;
        }
        int count = 0;
        for (int i=0; i<13*13*13*13; i++) {
            int dr = halflayer[i % 13];
            int dl = halflayer[i / 13 % 13];
            int ur = halflayer[i / 13 / 13 % 13];
            int ul = halflayer[i / 13 / 13 / 13];
            int value = ul<<18|ur<<12|dl<<6|dr;
            if (Integer.bitCount(value) == 16) {
                ShapeIdx[count++] = value;
            }
        }
        System.out.println(count);
        Shape s = new Shape();
        for (int i=0; i<3678*2; i++) {
            s.setIdx(i);
            TopMove[i] = s.topMove();
            TopMove[i] |= s.getIdx() << 4;
            s.setIdx(i);
            BottomMove[i] = s.bottomMove();
            BottomMove[i] |= s.getIdx() << 4;
            s.setIdx(i);
            s.twistMove();
            TwistMove[i] = s.getIdx();
        }
        for (int i=0; i<3768*2; i++) {
            ShapePrun[i] = -1;
            ShapePrunOpt[i] = -1;
        }

        //0 110110110110 011011011011
        //1 110110110110 110110110110
        //1 011011011011 011011011011
        //0 011011011011 110110110110
        ShapePrun[getShape2Idx(0x0db66db)] = 0;
        ShapePrun[getShape2Idx(0x1db6db6)] = 0;
        ShapePrun[getShape2Idx(0x16db6db)] = 0;
        ShapePrun[getShape2Idx(0x06dbdb6)] = 0;
        ShapePrunOpt[new FullCube().getShapeIdx()] = 0;
        int done = 4;
        int done0 = 0;
        int depth = -1;
        while (done != done0) {
            done0 = done;
            ++depth;
            System.out.println(done);
            for (int i=0; i<3768*2; i++) {
                if (ShapePrun[i] == depth) {
                    // try top
                    int m = 0;
                    int idx = i;
                    do {
                        idx = TopMove[idx];
                        m += idx & 0xf;
                        idx >>= 4;
                        if (ShapePrun[idx] == -1) {
                            ++done;
                            ShapePrun[idx] = depth + 1;
                        }
                    } while (m != 12);

                    // try bottom
                    m = 0;
                    idx = i;
                    do {
                        idx = BottomMove[idx];
                        m += idx & 0xf;
                        idx >>= 4;
                        if (ShapePrun[idx] == -1) {
                            ++done;
                            ShapePrun[idx] = depth + 1;
                        }
                    } while (m != 12);

                    // try twist
                    idx = TwistMove[i];
                    if (ShapePrun[idx] == -1) {
                        ++done;
                        ShapePrun[idx] = depth + 1;
                    }
                }
            }
        }
        done = 1;
        done0 = 0;
        depth = -1;
        while (done != done0) {
            done0 = done;
            ++depth;
            System.out.println(done);
            for (int i=0; i<3768*2; i++) {
                if (ShapePrunOpt[i] == depth) {
                    // try top
                    int m = 0;
                    int idx = i;
                    do {
                        idx = TopMove[idx];
                        m += idx & 0xf;
                        idx >>= 4;
                        if (ShapePrunOpt[idx] == -1) {
                            ++done;
                            ShapePrunOpt[idx] = depth + 1;
                        }
                    } while (m != 12);

                    // try bottom
                    m = 0;
                    idx = i;
                    do {
                        idx = BottomMove[idx];
                        m += idx & 0xf;
                        idx >>= 4;
                        if (ShapePrunOpt[idx] == -1) {
                            ++done;
                            ShapePrunOpt[idx] = depth + 1;
                        }
                    } while (m != 12);

                    // try twist
                    idx = TwistMove[i];
                    if (ShapePrunOpt[idx] == -1) {
                        ++done;
                        ShapePrunOpt[idx] = depth + 1;
                    }
                }
            }
        }
        inited = true;
    }

}
