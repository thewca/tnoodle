package org.worldcubeassociation.tnoodle.server.webscrambles

import org.yaml.snakeyaml.Yaml
import org.yaml.snakeyaml.constructor.Constructor

import java.util.Locale
import java.util.regex.Pattern

object Translate {
    private val BASE_LOCALE = Locale.forLanguageTag("en")
    val DEFAULT_LOCALE = System.getenv("TNOODLE_DEFAULT_LOCALE")?.let { Locale.forLanguageTag(it) } ?: BASE_LOCALE

    private val TRANSLATIONS = loadTranslationResources()

    val locales
        get() = TRANSLATIONS.keys

    private fun loadTranslationResources(): Map<Locale, Map<String, *>> {
        val yaml = Yaml(Constructor(HashMap::class.java))
        val locales = Locale.getAvailableLocales() + DEFAULT_LOCALE

        val loadedMaps = locales
            .mapNotNull { ClassLoader.getSystemResourceAsStream("i18n/${it.toLanguageTag()}.yml") }
            .map { yaml.load<Map<String, Map<String, *>>>(it) }

        return loadedMaps
            .reduce { a, b -> a + b }
            .mapKeys { Locale.forLanguageTag(it.key) }
    }

    private fun getTranslationsFor(locale: Locale): Map<String, *>? {
        return TRANSLATIONS[locale]
            ?: error("No locale matching given locale: ${locale.toLanguageTag()} found")
    }

    private fun translate(key: String, locale: Locale, azzertIfInvalid: Boolean): String? {
        var translation: Any? = getTranslationsFor(locale)

        val parts = key.split(".")

        for (part in parts) {
            if (translation !is HashMap<*, *>) {
                if (azzertIfInvalid) {
                    error("${locale.toLanguageTag()} couldn't find part $part of $key")
                } else {
                    return null
                }
            }

            translation = translation[part]
        }

        if (translation == null) {
            if (azzertIfInvalid) {
                error("${locale.toLanguageTag()} translation key $key not found")
            } else {
                return null
            }
        }

        if (translation !is String) {
            if (azzertIfInvalid) {
                error("${locale.toLanguageTag()} translation key $key is of type ${translation.javaClass}, but we were expecting String.")
            } else {
                return null
            }
        }

        return translation
    }

    fun translate(key: String, locale: Locale, substitutions: Map<String, String> = mapOf()): String {
        // Attempt to translate in the given locale.
        val translation = translate(key, locale, false)
            // If we couldn't find a translation in the given locale, fall back to the base locale.
            ?: translate(key, BASE_LOCALE, true)

        return interpolate(translation, substitutions)
    }

    // Interpolate translation keys in the same way Ruby on Rails does.
    // See: http://guides.rubyonrails.org/i18n.html#passing-variables-to-translations
    private fun interpolate(interpolateMe: String?, substitutions: Map<String, String>): String {
        // Copy the given Map, as we're going to mutate it later on.
        val mutateSubstitutions = substitutions.toMutableMap()

        // Now interpolate variables in the input string.
        //
        // Find anything that looks like %{...}, unless the percent sign is escaped as in %%{...}
        val templatePattern = Pattern.compile("(?<!%)%\\{([^}]+)}")
        val matcher = templatePattern.matcher(interpolateMe)

        val sb = StringBuffer()

        while (matcher.find()) {
            val key = matcher.group(1)

            val replacement = mutateSubstitutions.remove(key)
                ?: error(String.format("Substitution for key: %s not found", key))

            matcher.appendReplacement(sb, replacement)
        }

        matcher.appendTail(sb)
        assert(mutateSubstitutions.isEmpty()) { String.format("Unused substitution values: %s", mutateSubstitutions.keys) }

        return sb.toString()
    }
}
