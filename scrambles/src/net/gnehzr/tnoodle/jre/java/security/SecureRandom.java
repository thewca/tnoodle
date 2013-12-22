package java.security;

import java.util.Random;

/*
 * TODO port to use window.crypto?
 */
@SuppressWarnings("serial")
public class SecureRandom extends Random {
    public static SecureRandom getInstance(String algorithm, String provider) throws NoSuchAlgorithmException, NoSuchProviderException {
        return new SecureRandom();
    }
    public static SecureRandom getInstance(String algorithm) throws NoSuchAlgorithmException {
        return new SecureRandom();
    }

    public void setSeed(byte[] seed) {
        long longSeed = 0;
        int bitStep = Long.SIZE / Byte.SIZE;
        for(int i = 0; i < seed.length; i += 8) {
            long piece = 0;
            for(int offset = 0; offset < bitStep && i + offset < seed.length; offset++) {
                piece |= seed[i+offset] << (offset*Byte.SIZE);
            }
            longSeed ^= piece;
        }
        super.setSeed(longSeed);
    }

}
