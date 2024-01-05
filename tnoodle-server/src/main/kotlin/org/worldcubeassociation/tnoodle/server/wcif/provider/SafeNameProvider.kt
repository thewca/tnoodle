package org.worldcubeassociation.tnoodle.server.wcif.provider

import org.worldcubeassociation.tnoodle.server.zip.util.StringUtil.toFileSafeString

interface SafeNameProvider {
    val name: String

    val safeName: String
        get() = parseMarkdown(name)

    val fileSafeName: String
        get() = safeName.toFileSafeString()

    companion object {
        // In case venue or room is using markdown
        private fun parseMarkdown(s: String): String {
            if (s.contains('[') && s.contains(']')) {
                return s.substring(s.indexOf('[') + 1, s.indexOf(']'))
            }

            return s
        }
    }
}
