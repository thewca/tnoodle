package org.worldcubeassociation.tnoodle.server.cryptography

import java.util.*
import javax.crypto.Cipher

object StringEncryption {
    fun applyCipherEncrypt(initedCipher: Cipher, unencrypted: String): String {
        val contentBytes = unencrypted.toByteArray(SymmetricCipher.CIPHER_CHARSET)

        val cipherContent = initedCipher.doFinal(contentBytes)
        return Base64.getEncoder().encodeToString(cipherContent)
    }

    fun applyCipherDecrypt(initedCipher: Cipher, encryptedBase64: String): String {
        val contentBytes = Base64.getDecoder().decode(encryptedBase64)

        val cipherContent = initedCipher.doFinal(contentBytes)
        return cipherContent.toString(SymmetricCipher.CIPHER_CHARSET)
    }
}
