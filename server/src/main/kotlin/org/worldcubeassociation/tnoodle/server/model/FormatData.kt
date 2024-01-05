package org.worldcubeassociation.tnoodle.server.model

enum class FormatData(val key: String, val description: String, val tag: String, val numSolves: Int) {
    AVERAGE_OF_5("a", "Average of 5", "Ao5", 5),
    MEAN_OF_3("m", "Mean of 3", "Mo3", 3),
    BEST_OF_3("3", "Best of 3", "Bo3", 3),
    BEST_OF_2("2", "Best of 2", "Bo2", 2),
    BEST_OF_1("1", "Best of 1", "Bo1", 1);

    companion object {
        val WCA_FORMATS = entries.associateBy { it.key }.toSortedMap()

        val BIG_AVERAGE_FORMATS = sortedSetOf(AVERAGE_OF_5, BEST_OF_3, BEST_OF_2, BEST_OF_1)
        val SMALL_AVERAGE_FORMATS = sortedSetOf(MEAN_OF_3, BEST_OF_2, BEST_OF_1)
        val BLD_SPECIAL_FORMATS = sortedSetOf(BEST_OF_3, BEST_OF_2, BEST_OF_1)

        val DEFAULT_FALLBACK_FORMAT = AVERAGE_OF_5
    }
}
