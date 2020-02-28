package org.worldcubeassociation.tnoodle.server.signature

import org.bouncycastle.util.io.pem.PemReader
import java.security.KeyFactory
import java.security.PublicKey
import java.security.Signature
import java.security.SignatureException
import java.security.spec.X509EncodedKeySpec
import java.util.*

object BuildVerification {
    const val ENCRYPTION_ALGORITHM = "RSA"
    const val SIGNATURE_ALGORITHM = "SHA256with$ENCRYPTION_ALGORITHM"

    private const val PUBLIC_KEY_PEM = "/signature/tnoodle_public.pem"

    val BUILD_VERIFIED by lazy { checkBuildSignature(PUBLIC_KEY_PEM) }

    val PUBLIC_KEY_BYTES = loadPublicKeyBytes(PUBLIC_KEY_PEM)
    val PUBLIC_KEY_BYTES_BASE64 = PUBLIC_KEY_BYTES?.let { Base64.getEncoder().encodeToString(it) }

    private val keyFactory = KeyFactory.getInstance(ENCRYPTION_ALGORITHM)
    private val signatureInstance = Signature.getInstance(SIGNATURE_ALGORITHM)

    fun loadPublicKeyBytes(resourcePath: String): ByteArray? {
        return this::class.java.getResourceAsStream(resourcePath)?.reader()
            ?.use { PemReader(it).readPemObject().content }
    }

    fun loadPublicKey(keyBytes: ByteArray): PublicKey {
        val spec = X509EncodedKeySpec(keyBytes)
        return keyFactory.generatePublic(spec)
    }

    fun checkBuildSignature(resourcePath: String): Boolean {
        val publicKey = PUBLIC_KEY_BYTES?.let(this::loadPublicKey) ?: return false

        val fileBytes = this::class.java.getResourceAsStream(resourcePath)?.readBytes()
            ?: return false

        val preparedCheck = signatureInstance.apply {
            initVerify(publicKey)
            update(fileBytes)
        }

        val signatureBytes = this::class.java.getResourceAsStream("$resourcePath.sign")?.readBytes()
            ?: return false

        return try {
            preparedCheck.verify(signatureBytes)
        } catch (e: SignatureException) {
            false
        }
    }
}
