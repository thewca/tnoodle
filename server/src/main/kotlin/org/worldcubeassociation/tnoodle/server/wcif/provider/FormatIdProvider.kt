package org.worldcubeassociation.tnoodle.server.wcif.provider

import org.worldcubeassociation.tnoodle.server.model.FormatData

interface FormatIdProvider {
    val formatId: String

    val formatModel: FormatData?
        get() = FormatData.WCA_FORMATS[formatId]
}
