package org.worldcubeassociation.tnoodle.server.serial

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.crypto.BuildVerification

@Serializable
data class VersionInfo(
    val projectName: String,
    val projectVersion: String,
    val signedBuild: Boolean,
    val signatureKeyBytes: String?
) {
    companion object {
        fun fromEnvironmentConfig(config: ServerEnvironmentConfig): VersionInfo {
            return VersionInfo(
                config.projectName,
                config.projectVersion,
                BuildVerification.BUILD_VERIFIED,
                BuildVerification.VERIFICATION_KEY_BYTES_BASE64
            )
        }
    }
}
