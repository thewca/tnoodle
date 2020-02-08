package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
sealed class Extension(val specUrl: String) {
    abstract val id: String
    abstract val data: Any
}

@Serializable
@SerialName(FmcExtension.ID)
data class FmcExtension(override val data: Boolean) : Extension(SPEC_URL) {
    override val id get() = ID

    companion object {
        const val ID = "org.worldcubeassociation.tnoodle.FmcFlag"
        const val SPEC_URL = "TODO"
    }
}

@Serializable
@SerialName(FmcAttemptCountExtension.ID)
data class FmcAttemptCountExtension(override val data: Int) : Extension(SPEC_URL) {
    override val id get() = FmcExtension.ID

    companion object {
        const val ID = "org.worldcubeassociation.tnoodle.FmcAttemptCount"
        const val SPEC_URL = "TODO"
    }
}

@Serializable
@SerialName(ExtraScrambleCountExtension.ID)
data class ExtraScrambleCountExtension(override val data: Int) : Extension(SPEC_URL) {
    override val id get() = FmcExtension.ID

    companion object {
        const val ID = "org.worldcubeassociation.tnoodle.ExtraScrambleCount"
        const val SPEC_URL = "TODO"
    }
}

@Serializable
@SerialName(MultiScrambleCountExtension.ID)
data class MultiScrambleCountExtension(override val data: Int) : Extension(SPEC_URL) {
    override val id get() = FmcExtension.ID

    companion object {
        const val ID = "org.worldcubeassociation.tnoodle.MultiScrambleCount"
        const val SPEC_URL = "TODO"
    }
}
