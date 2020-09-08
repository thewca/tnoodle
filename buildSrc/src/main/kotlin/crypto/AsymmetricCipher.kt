package crypto

import org.bouncycastle.util.io.pem.PemReader
import org.gradle.api.Project
import java.security.*
import java.security.spec.PKCS8EncodedKeySpec

object AsymmetricCipher {
    const val ENCRYPTION_ALGORITHM = "RSA"

    private val CIPHER_KEY_FACTORY = KeyFactory.getInstance(ENCRYPTION_ALGORITHM)

    private fun Project.loadRSAKeyBytes(path: String): ByteArray {
        return file(path).reader().use { PemReader(it).readPemObject().content }
    }

    private fun generatePrivateKey(keyBytes: ByteArray): PrivateKey {
        val spec = PKCS8EncodedKeySpec(keyBytes)
        return CIPHER_KEY_FACTORY.generatePrivate(spec)
    }

    fun Project.loadPrivateKey(path: String): PrivateKey {
        val keyBytes = loadRSAKeyBytes(path)
        return generatePrivateKey(keyBytes)
    }
}
