package org.worldcubeassociation.tnoodle.server.cryptography

import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

object SymmetricCipher {
    const val CIPHER_SALT = "TNOODLE_WCA"
    const val CIPHER_KEY_ITERATIONS = 65536
    const val CIPHER_KEY_LENGTH = 256

    const val CIPHER_ALGORITHM = "AES"
    const val CIPHER_KEY_ALGORITHM = "PBKDF2WithHmacSHA$CIPHER_KEY_LENGTH"

    val CIPHER_CHARSET = Charsets.UTF_8

    val CIPHER_INSTANCE = Cipher.getInstance(CIPHER_ALGORITHM)
    val CIPHER_KEY_FACTORY = SecretKeyFactory.getInstance(CIPHER_KEY_ALGORITHM)

    fun generateKey(password: String): SecretKey {
        val saltBytes = CIPHER_SALT.toByteArray(CIPHER_CHARSET)
        val spec = PBEKeySpec(password.toCharArray(), saltBytes, CIPHER_KEY_ITERATIONS, CIPHER_KEY_LENGTH)

        val key = CIPHER_KEY_FACTORY.generateSecret(spec)
        return SecretKeySpec(key.encoded, CIPHER_ALGORITHM)
    }
}
