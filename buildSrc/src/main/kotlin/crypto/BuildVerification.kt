package crypto

import org.gradle.api.Project
import java.security.Signature
import crypto.AsymmetricCipher.loadPrivateKey
import java.io.File

object BuildVerification {
    const val SIGNATURE_ALGORITHM = "SHA256with${AsymmetricCipher.ENCRYPTION_ALGORITHM}"

    const val SIGNATURE_PACKAGE = "signature"
    const val SIGNATURE_SUFFIX = "sign"

    private val SIGNATURE_INSTANCE by lazy { Signature.getInstance(SIGNATURE_ALGORITHM) }

    fun Project.createBuildSignature(signingKeyPath: String, fileToSign: File): ByteArray {
        val privateKey = loadPrivateKey(signingKeyPath)
        val fileBytes = fileToSign.readBytes()

        val preparedCheck = SIGNATURE_INSTANCE.apply {
            initSign(privateKey)
            update(fileBytes)
        }

        return preparedCheck.sign()
    }
}
