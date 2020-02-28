package org.worldcubeassociation.tnoodle.server.signature

import org.bouncycastle.util.io.pem.PemReader
import java.security.*
import java.security.spec.PKCS8EncodedKeySpec
import java.security.spec.X509EncodedKeySpec
import java.util.*

object BuildVerification {
    const val ENCRYPTION_ALGORITHM = "RSA"
    const val SIGNATURE_ALGORITHM = "SHA256with$ENCRYPTION_ALGORITHM"

    private const val PUBLIC_KEY_PEM = "/signature/tnoodle_public.pem"
    private const val PRIVATE_KEY_PEM8 = "/signature/tnoodle_private.pkcs8.pem"

    val BUILD_VERIFIED by lazy { checkBuildSignature(PUBLIC_KEY_PEM) }

    val PUBLIC_KEY_BYTES = loadRSAKeyBytes(PUBLIC_KEY_PEM)
    val PUBLIC_KEY_BYTES_BASE64 = PUBLIC_KEY_BYTES?.let { Base64.getEncoder().encodeToString(it) }

    val PRIVATE_KEY_BYTES = loadRSAKeyBytes(PRIVATE_KEY_PEM8)

    val RSA_PUBLIC_KEY by lazy { PUBLIC_KEY_BYTES?.let(this::loadPublicKey) }
    val RSA_PRIVATE_KEY by lazy { PRIVATE_KEY_BYTES?.let(this::loadPrivateKey) }

    private val keyFactory = KeyFactory.getInstance(ENCRYPTION_ALGORITHM)
    private val signatureInstance = Signature.getInstance(SIGNATURE_ALGORITHM)

    fun loadRSAKeyBytes(resourcePath: String): ByteArray? {
        return this::class.java.getResourceAsStream(resourcePath)?.reader()
            ?.use { PemReader(it).readPemObject().content }
    }

    fun loadPublicKey(keyBytes: ByteArray): PublicKey {
        val spec = X509EncodedKeySpec(keyBytes)
        return keyFactory.generatePublic(spec)
    }

    fun loadPrivateKey(keyBytes: ByteArray): PrivateKey {
        val spec = PKCS8EncodedKeySpec(keyBytes)
        return keyFactory.generatePrivate(spec)
    }

    fun checkBuildSignature(resourcePath: String): Boolean {
        val publicKey = RSA_PUBLIC_KEY ?: return false

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
