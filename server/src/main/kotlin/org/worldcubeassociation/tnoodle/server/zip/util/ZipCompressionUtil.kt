package org.worldcubeassociation.tnoodle.server.zip.util

import org.worldcubeassociation.tnoodle.core.model.Renderable
import org.worldcubeassociation.tnoodle.core.model.zip.ZipArchive
import org.worldcubeassociation.tnoodle.server.zip.engine.Zip4JEngine

object ZipCompressionUtil {
    fun ZipArchive.compress(password: String? = null): ByteArray {
        val renderable = Renderable(this, Zip4JEngine)
        return renderable.render(password)
    }
}
