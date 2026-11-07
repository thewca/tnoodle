package org.worldcubeassociation.tnoodle.server.serial

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.crypto.BuildVerification

@Serializable
data class VersionInfo(
    @SerialName("project_name") val projectName: String,
    @SerialName("project_version") val projectVersion: String,
    @SerialName("is_signed_build") val signedBuild: Boolean,
    @SerialName("signature_key_bytes") val signatureKeyBytes: String?
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
