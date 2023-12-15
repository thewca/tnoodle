package org.worldcubeassociation.tnoodle.server.webscrambles

import org.worldcubeassociation.tnoodle.server.webscrambles.exceptions.TranslationException
import org.yaml.snakeyaml.LoaderOptions
import org.yaml.snakeyaml.Yaml
import org.yaml.snakeyaml.constructor.Constructor

import java.util.Locale

object Translate {
    private val BASE_LOCALE = Locale.forLanguageTag("en")
    val DEFAULT_LOCALE = System.getenv("TNOODLE_DEFAULT_LOCALE")
        ?.let { Locale.forLanguageTag(it) } ?: BASE_LOCALE

    val TRANSLATIONS = loadTranslationResources()

    val TRANSLATED_LOCALES
        get() = TRANSLATIONS.keys

    val LOCALES_BY_LANG_TAG = TRANSLATED_LOCALES.associateBy { it.toLanguageTag() }

    private fun loadTranslationResources(): Map<Locale, Map<String, *>> {
        val yaml = Yaml(Constructor(HashMap::class.java, LoaderOptions()))
        val locales = Locale.getAvailableLocales() + DEFAULT_LOCALE

        val loadedMaps = locales
            .mapNotNull { javaClass.getResourceAsStream("/i18n/${it.toLanguageTag()}.yml") }
            .map { yaml.load<Map<String, Map<String, *>>>(it) }

        val mergedMaps = loadedMaps
            .takeIf { it.isNotEmpty() }
            ?.reduce { a, b -> a + b }
            ?.mapKeys { Locale.forLanguageTag(it.key) }

        return mergedMaps ?: emptyMap()
    }

    private fun getTranslationsFor(locale: Locale): Map<String, *> {
        return TRANSLATIONS[locale]
            ?: TranslationException.error("No locale matching given locale: ${locale.toLanguageTag()} found")
    }

    private fun translateNullable(key: String, locale: Locale): String? {
        val baseTranslations = getTranslationsFor(locale)
        val parts = key.split(".")

        return descendKeys(baseTranslations, parts)
    }

    private fun translateWithError(key: String, locale: Locale): String {
        val baseTranslations = getTranslationsFor(locale)
        val parts = key.split(".")

        val translation = descendKeys(baseTranslations, parts) {
            "${locale.toLanguageTag()} couldn't find part $it of $key"
        } ?: TranslationException.error("${locale.toLanguageTag()} translation key $key not found")

        return translation as? String
            ?: TranslationException.error("${locale.toLanguageTag()} translation key $key is of type ${translation.javaClass}, but we were expecting String.")
    }

    private tailrec fun descendKeys(
        translationGroup: Map<*, *>,
        parts: List<String>,
        errorProvider: ((String) -> String)? = null
    ): String? {
        if (parts.isEmpty()) {
            return null
        }

        val nextPart = parts.first()
        val remainingParts = parts.drop(1)

        val nextGroup = translationGroup[nextPart]

        if (remainingParts.isEmpty()) {
            return nextGroup as? String
        }

        if (nextGroup !is Map<*, *>) {
            return errorProvider?.invoke(nextPart)
                ?.let { TranslationException.error(it) }
        }

        return descendKeys(nextGroup, remainingParts)
    }

    fun translate(key: String, locale: Locale, substitutions: Map<String, String> = mapOf()): String {
        // Attempt to translate in the given locale.
        val translation = translateNullable(key, locale)
            // If we couldn't find a translation in the given locale, fall back to the base locale.
            ?: translateWithError(key, BASE_LOCALE)

        return interpolate(translation, substitutions)
    }

    operator fun invoke(key: String, locale: Locale, substitutions: Map<String, String> = mapOf()) =
        translate(key, locale, substitutions)

    // Interpolate translation keys in the same way Ruby on Rails does.
    // See: http://guides.rubyonrails.org/i18n.html#passing-variables-to-translations
    private fun interpolate(interpolateMe: String, substitutions: Map<String, String>): String {
        // Copy the given Map, as we're going to mutate it later on.
        val mutateSubstitutions = substitutions.toMutableMap()

        // Now interpolate variables in the input string.
        //
        // Find anything that looks like %{...}, unless the percent sign is escaped as in %%{...}
        val pattern = Regex("(?<!%)%\\{([^}]+)}")
        val interpolated = pattern.replace(interpolateMe) {
            val key = it.groups[1]?.value
                ?: TranslationException.error("Translation Regex broken: Group without content for $interpolateMe")

            mutateSubstitutions.remove(key)
                ?: TranslationException.error("Substitution for key: $key not found")
        }

        assert(mutateSubstitutions.isEmpty()) { "Unused substitution values: ${mutateSubstitutions.keys}" }

        return interpolated
    }
}
