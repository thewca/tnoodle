package org.worldcubeassociation.tnoodle.core.crypto

import org.bouncycastle.util.io.pem.PemReader
import java.security.*
import java.security.spec.X509EncodedKeySpec

object AsymmetricCipher {
    const val ENCRYPTION_ALGORITHM = "RSA"
    const val PUBLIC_KEY_PEM = "/rsa/tnoodle_public.pem"

    private val PUBLIC_KEY_BYTES = loadRSAKeyBytes(PUBLIC_KEY_PEM)
    val RSA_PUBLIC_KEY by lazy { PUBLIC_KEY_BYTES?.let(this::generatePublicKey) }

    private val CIPHER_KEY_FACTORY = KeyFactory.getInstance(ENCRYPTION_ALGORITHM)

    private fun loadRSAKeyBytes(resourcePath: String): ByteArray? {
        return this::class.java.getResourceAsStream(resourcePath)?.reader()
            ?.use { PemReader(it).readPemObject().content }
    }

    fun generatePublicKey(keyBytes: ByteArray): PublicKey {
        val spec = X509EncodedKeySpec(keyBytes)
        return CIPHER_KEY_FACTORY.generatePublic(spec)
    }
}
