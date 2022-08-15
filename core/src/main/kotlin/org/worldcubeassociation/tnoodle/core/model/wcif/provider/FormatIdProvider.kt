package org.worldcubeassociation.tnoodle.core.model.wcif.provider

import org.worldcubeassociation.tnoodle.core.model.scramble.FormatData

interface FormatIdProvider {
    val formatId: String

    val formatModel: FormatData?
        get() = FormatData.WCA_FORMATS[formatId]
}
