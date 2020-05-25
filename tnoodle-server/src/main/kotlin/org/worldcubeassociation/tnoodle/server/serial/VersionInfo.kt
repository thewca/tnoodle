package org.worldcubeassociation.tnoodle.server.serial

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.crypto.BuildVerification

@Serializable
data class VersionInfo(
    val runningVersion: String,
    val projectName: String,
    val projectVersion: String,
    val signedBuild: Boolean,
    val signatureKeyBytes: String?
) {
    companion object {
        fun fromEnvironmentConfig(config: ServerEnvironmentConfig): VersionInfo {
            //FIXME this is a temporary stub implementation until we have actual key pairs
            //val buildVerified = BuildVerification.BUILD_VERIFIED
            val buildVerified = config.projectName == "TNoodle-WCA"

            return VersionInfo(
                config.title,
                config.projectName,
                config.projectVersion,
                buildVerified,
                BuildVerification.VERIFICATION_KEY_BYTES_BASE64
            )
        }
    }
}
