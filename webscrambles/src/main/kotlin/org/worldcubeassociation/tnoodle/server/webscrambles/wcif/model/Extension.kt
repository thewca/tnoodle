package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.serializer

@Serializable
sealed class Extension(val id: String, val specUrl: String) {
    abstract val data: Any
}

inline fun <reified T : Extension> List<Extension>.findExtension() =
    filterIsInstance<T>().singleOrNull()

@Serializable
@SerialName(FmcExtension.ID)
data class FmcExtension(override val data: Boolean) : Extension(ID, SPEC_URL) {
    companion object {
        const val ID = "org.worldcubeassociation.tnoodle.FmcFlag"
        const val SPEC_URL = "TODO"
    }
}

@Serializable
@SerialName(FmcAttemptCountExtension.ID)
data class FmcAttemptCountExtension(override val data: Int) : Extension(ID, SPEC_URL) {
    companion object {
        const val ID = "org.worldcubeassociation.tnoodle.FmcAttemptCount"
        const val SPEC_URL = "TODO"
    }
}

@Serializable
@SerialName(ExtraScrambleCountExtension.ID)
data class ExtraScrambleCountExtension(override val data: Int) : Extension(ID, SPEC_URL) {
    companion object {
        const val ID = "org.worldcubeassociation.tnoodle.ExtraScrambleCount"
        const val SPEC_URL = "TODO"
    }
}

@Serializable
@SerialName(MultiScrambleCountExtension.ID)
data class MultiScrambleCountExtension(override val data: Boolean) : Extension(ID, SPEC_URL) {
    companion object {
        const val ID = "org.worldcubeassociation.tnoodle.MultiScrambleCount"
        const val SPEC_URL = "TODO"
    }
}
