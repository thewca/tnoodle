package org.worldcubeassociation.tnoodle.server.signature

object BuildVerification {
    const val VERIFICATION_FILE = "icons/tnoodle_logo_1024.png"

    val BUILD_VERIFIED by lazy { checkBuildSignature(VERIFICATION_FILE) }

    fun checkBuildSignature(resourcePath: String): Boolean {
        return false
    }
}
