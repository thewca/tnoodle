package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Extension

@Serializable
sealed class ExtensionBuilder(private val specUrl: String) {
    abstract val id: String

    fun build(): Extension {
        val rawData = JsonConfig.SERIALIZER.toJson(serializer(), this)
        return Extension(id, specUrl, rawData.jsonObject)
    }

    companion object {
        val REGISTERED_CHILDREN = List(serializer().descriptor.elementsCount) {
            serializer().descriptor.getElementName(it)
        }
    }
}

@Serializable
@SerialName(FmcExtension.ID)
data class FmcExtension(val isFmc: Boolean) : ExtensionBuilder(SPEC_URL) {
    override val id get() = ID

    companion object {
        const val ID = "org.worldcubeassociation.tnoodle.FmcFlag"
        const val SPEC_URL = "TODO"
    }
}

@Serializable
@SerialName(FmcLanguagesExtension.ID)
data class FmcLanguagesExtension(val languageTags: List<String>) : ExtensionBuilder(SPEC_URL) {
    override val id get() = ID

    companion object {
        const val ID = "org.worldcubeassociation.tnoodle.FmcLanguages"
        const val SPEC_URL = "TODO"
    }
}

@Serializable
@SerialName(FmcAttemptCountExtension.ID)
data class FmcAttemptCountExtension(val totalAttempts: Int) : ExtensionBuilder(SPEC_URL) {
    override val id get() = ID

    companion object {
        const val ID = "org.worldcubeassociation.tnoodle.FmcAttemptCount"
        const val SPEC_URL = "TODO"
    }
}

@Serializable
@SerialName(ExtraScrambleCountExtension.ID)
data class ExtraScrambleCountExtension(val extraAttempts: Int) : ExtensionBuilder(SPEC_URL) {
    override val id get() = ID

    companion object {
        const val ID = "org.worldcubeassociation.tnoodle.ExtraScrambleCount"
        const val SPEC_URL = "TODO"
    }
}

@Serializable
@SerialName(MultiScrambleCountExtension.ID)
data class MultiScrambleCountExtension(val requestedScrambles: Int) : ExtensionBuilder(SPEC_URL) {
    override val id get() = ID

    companion object {
        const val ID = "org.worldcubeassociation.tnoodle.MultiScrambleCount"
        const val SPEC_URL = "TODO"
    }
}

@Serializable
@SerialName(SheetCopyCountExtension.ID)
data class SheetCopyCountExtension(val numCopies: Int) : ExtensionBuilder(SPEC_URL) {
    override val id get() = ID

    companion object {
        const val ID = "org.worldcubeassociation.tnoodle.SheetCopyCount"
        const val SPEC_URL = "TODO"
    }
}
