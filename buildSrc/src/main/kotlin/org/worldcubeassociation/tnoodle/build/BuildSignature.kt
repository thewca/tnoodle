package org.worldcubeassociation.tnoodle.build

import org.gradle.api.Project
import java.io.File
import org.worldcubeassociation.tnoodle.core.crypto.AsymmetricCipher
import org.worldcubeassociation.tnoodle.core.crypto.BuildVerification

object BuildSignature {
    const val SIGNATURE_PACKAGE = BuildVerification.SIGNATURE_PACKAGE
    const val SIGNATURE_SUFFIX = BuildVerification.SIGNATURE_SUFFIX

    fun Project.createBuildSignature(signingKeyPath: String, fileToSign: File): ByteArray {
        val privateKeyBytes = AsymmetricCipher.loadRSAKeyBytesFromFile(file(signingKeyPath))
        val privateKey = AsymmetricCipher.generatePrivateKey(privateKeyBytes)

        val fileBytes = fileToSign.readBytes()

        val preparedCheck = BuildVerification.SIGNATURE_INSTANCE.apply {
            initSign(privateKey)
            update(fileBytes)
        }

        return preparedCheck.sign()
    }
}
