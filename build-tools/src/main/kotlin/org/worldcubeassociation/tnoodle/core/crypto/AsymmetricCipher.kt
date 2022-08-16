package org.worldcubeassociation.tnoodle.core.crypto

import org.bouncycastle.util.io.pem.PemReader
import java.io.File
import java.io.Reader
import java.security.*
import java.security.spec.PKCS8EncodedKeySpec
import java.security.spec.X509EncodedKeySpec

object AsymmetricCipher {
    const val ENCRYPTION_ALGORITHM = "RSA"
    const val PUBLIC_KEY_PEM = "/rsa/tnoodle_public.pem"

    private val PUBLIC_KEY_BYTES = loadRSAKeyBytesFromResource(PUBLIC_KEY_PEM)
    val RSA_PUBLIC_KEY by lazy { generatePublicKey(PUBLIC_KEY_BYTES) }

    private val CIPHER_KEY_FACTORY = KeyFactory.getInstance(ENCRYPTION_ALGORITHM)

    fun loadRSAKeyBytesFromResource(resourcePath: String): ByteArray {
        val keyStream = this::class.java.getResourceAsStream(resourcePath)
            ?: error("RSA key resource not found: $resourcePath")

        return loadRSAKeyBytes(keyStream.reader())
    }

    fun loadRSAKeyBytesFromFile(keyFile: File): ByteArray {
        return loadRSAKeyBytes(keyFile.reader())
    }

    private fun loadRSAKeyBytes(keyFileReader: Reader): ByteArray {
        return keyFileReader.use { PemReader(it).readPemObject().content }
    }

    fun generatePublicKey(keyBytes: ByteArray): PublicKey {
        val spec = X509EncodedKeySpec(keyBytes)
        return CIPHER_KEY_FACTORY.generatePublic(spec)
    }

    fun generatePrivateKey(keyBytes: ByteArray): PrivateKey {
        val spec = PKCS8EncodedKeySpec(keyBytes)
        return CIPHER_KEY_FACTORY.generatePrivate(spec)
    }
}
