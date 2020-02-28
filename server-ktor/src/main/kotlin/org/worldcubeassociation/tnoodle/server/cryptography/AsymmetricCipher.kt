package org.worldcubeassociation.tnoodle.server.cryptography

import org.bouncycastle.util.io.pem.PemReader
import java.security.*
import java.security.spec.PKCS8EncodedKeySpec
import java.security.spec.X509EncodedKeySpec
import java.util.*

object AsymmetricCipher {
    const val ENCRYPTION_ALGORITHM = "RSA"
    const val PUBLIC_KEY_PEM = "/rsa/tnoodle_public.pem"
    private const val PRIVATE_KEY_PEM8 = "/rsa/tnoodle_private.pkcs8.pem"

    val PUBLIC_KEY_BYTES = loadRSAKeyBytes(PUBLIC_KEY_PEM)
    val PUBLIC_KEY_BYTES_BASE64 = PUBLIC_KEY_BYTES?.let { Base64.getEncoder().encodeToString(it) }

    val PRIVATE_KEY_BYTES = loadRSAKeyBytes(PRIVATE_KEY_PEM8)

    val RSA_PUBLIC_KEY by lazy { PUBLIC_KEY_BYTES?.let(this::generatePublicKey) }
    val RSA_PRIVATE_KEY by lazy { PRIVATE_KEY_BYTES?.let(this::generatePrivateKey) }

    private val CIPHER_KEY_FACTORY = KeyFactory.getInstance(ENCRYPTION_ALGORITHM)

    private fun loadRSAKeyBytes(resourcePath: String): ByteArray? {
        return this::class.java.getResourceAsStream(resourcePath)?.reader()
            ?.use { PemReader(it).readPemObject().content }
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
