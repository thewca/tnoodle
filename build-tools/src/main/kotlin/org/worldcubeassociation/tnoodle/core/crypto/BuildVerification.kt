package org.worldcubeassociation.tnoodle.core.crypto

import java.security.*
import java.util.*

object BuildVerification {
    const val SIGNATURE_PACKAGE = "signature"
    const val SIGNATURE_SUFFIX = "sign"

    const val SIGNATURE_ALGORITHM = "SHA256with${AsymmetricCipher.ENCRYPTION_ALGORITHM}"

    val SIGNATURE_INSTANCE by lazy { Signature.getInstance(SIGNATURE_ALGORITHM) }
    private val BASE64_ENCODER by lazy { Base64.getEncoder() }

    private val VERIFICATION_KEY = AsymmetricCipher.RSA_PUBLIC_KEY

    val BUILD_VERIFIED by lazy { checkBuildSignature(AsymmetricCipher.PUBLIC_KEY_PEM) }
    val VERIFICATION_KEY_BYTES_BASE64 by lazy { VERIFICATION_KEY.encoded?.let(BASE64_ENCODER::encodeToString) }

    fun checkBuildSignature(resourcePath: String): Boolean {
        val fileBytes = this::class.java.getResourceAsStream(resourcePath)?.readBytes()
            ?: return false

        val preparedCheck = SIGNATURE_INSTANCE.apply {
            initVerify(VERIFICATION_KEY)
            update(fileBytes)
        }

        val signaturePath = "/$SIGNATURE_PACKAGE$resourcePath.$SIGNATURE_SUFFIX"
        val signatureBytes = this::class.java.getResourceAsStream(signaturePath)?.readBytes()
            ?: return false

        return try {
            preparedCheck.verify(signatureBytes)
        } catch (e: SignatureException) {
            false
        }
    }
}
