package org.worldcubeassociation.tnoodle.server.signature

import org.bouncycastle.util.io.pem.PemReader
import java.security.KeyFactory
import java.security.PublicKey
import java.security.Signature
import java.security.spec.X509EncodedKeySpec

object BuildVerification {
    const val PUBLIC_KEY_PEM = "/signature/tnoodle_public.pem"

    val BUILD_VERIFIED by lazy { checkBuildSignature(PUBLIC_KEY_PEM) }

    private val keyFactory = KeyFactory.getInstance("RSA")
    private val publicTnoodleKey = loadPublicKey(PUBLIC_KEY_PEM)

    private val signatureInstance = Signature.getInstance("SHA256withRSA")
    private val signatureProvider get() = signatureInstance.apply { initVerify(publicTnoodleKey) }

    fun loadPublicKey(resourcePath: String): PublicKey {
        this::class.java.getResourceAsStream(resourcePath)?.reader()?.use {
            val keyBytes = PemReader(it).readPemObject().content

            val spec = X509EncodedKeySpec(keyBytes, "RSA")
            return keyFactory.generatePublic(spec)
        } ?: error("Key at $resourcePath not found!")
    }

    fun checkBuildSignature(resourcePath: String): Boolean {
        val fileBytes = this::class.java.getResourceAsStream(resourcePath)?.readAllBytes()
            ?: return false

        val preparedCheck = signatureProvider.apply { update(fileBytes) }

        val signatureBytes = this::class.java.getResourceAsStream("/$resourcePath.sign")?.readAllBytes()
            ?: return false

        return preparedCheck.verify(signatureBytes)
    }
}
