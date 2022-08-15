package org.worldcubeassociation.tnoodle.core.model.wcif.provider

interface SafeNameProvider {
    val name: String

    val safeName: String
        get() = parseMarkdown(name)

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
