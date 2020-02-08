package org.worldcubeassociation.tnoodle.server.webscrambles.zip

import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.ScrambleDrawingData
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition

data class CompetitionZippingData(val wcif: Competition, val namedSheets: Map<String, ScrambleDrawingData>)
