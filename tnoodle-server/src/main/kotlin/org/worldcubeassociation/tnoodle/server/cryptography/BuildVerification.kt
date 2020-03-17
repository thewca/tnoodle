package org.worldcubeassociation.tnoodle.server.cryptography

import java.security.*

object BuildVerification {
    const val SIGNATURE_ALGORITHM = "SHA256with${AsymmetricCipher.ENCRYPTION_ALGORITHM}"

    val BUILD_VERIFIED by lazy { checkBuildSignature(AsymmetricCipher.PUBLIC_KEY_PEM) }

    private val SIGNATURE_INSTANCE = Signature.getInstance(SIGNATURE_ALGORITHM)

    fun checkBuildSignature(resourcePath: String): Boolean {
        val publicKey = AsymmetricCipher.RSA_PUBLIC_KEY ?: return false

        val fileBytes = this::class.java.getResourceAsStream(resourcePath)?.readBytes()
            ?: return false

        val preparedCheck = SIGNATURE_INSTANCE.apply {
            initVerify(publicKey)
            update(fileBytes)
        }

        val signaturePath = "/signature$resourcePath.sign"
        val signatureBytes = this::class.java.getResourceAsStream(signaturePath)?.readBytes()
            ?: return false

        return try {
            preparedCheck.verify(signatureBytes)
        } catch (e: SignatureException) {
            false
        }
    }
}
