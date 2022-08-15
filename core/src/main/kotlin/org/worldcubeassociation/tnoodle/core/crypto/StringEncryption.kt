package org.worldcubeassociation.tnoodle.core.crypto

import java.util.*
import javax.crypto.Cipher

object StringEncryption {
    fun applyCipherEncrypt(initedCipher: Cipher, unencrypted: String): String {
        val contentBytes = unencrypted.toByteArray(SymmetricCipher.CIPHER_CHARSET)

        val cipherContent = initedCipher.doFinal(contentBytes)
        return cipherContent.encodeBase64()
    }

    fun applyCipherDecrypt(initedCipher: Cipher, encryptedBase64: String): String {
        val contentBytes = encryptedBase64.decodeBase64()

        val cipherContent = initedCipher.doFinal(contentBytes)
        return cipherContent.toString(SymmetricCipher.CIPHER_CHARSET)
    }

    private val BASE64_DECODER by lazy { Base64.getDecoder() }
    private val BASE64_ENCODER by lazy { Base64.getEncoder() }

    fun String.decodeBase64(): ByteArray = BASE64_DECODER.decode(this)
    fun ByteArray.encodeBase64(): String = BASE64_ENCODER.encodeToString(this)
}
