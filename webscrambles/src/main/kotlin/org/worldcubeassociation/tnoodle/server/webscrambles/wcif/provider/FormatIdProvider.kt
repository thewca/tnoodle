package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.provider

import org.worldcubeassociation.tnoodle.server.plugins.FormatPlugins

interface FormatIdProvider {
    val formatId: String

    val formatPlugin: FormatPlugins?
        get() = FormatPlugins.WCA_FORMATS[formatId]
}
