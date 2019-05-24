package org.worldcubeassociation.tnoodle.server.webscrambles

import org.worldcubeassociation.tnoodle.server.WebServerUtils
import org.yaml.snakeyaml.Yaml
import org.yaml.snakeyaml.constructor.Constructor

import java.io.File
import java.io.FileNotFoundException
import java.util.HashMap
import java.util.Locale
import java.util.logging.Level
import java.util.logging.Logger
import java.util.regex.Pattern

object Translate {
    private val BASE_LOCALE = Locale.forLanguageTag("en")
    val DEFAULT_LOCALE = System.getenv("TNOODLE_DEFAULT_LOCALE")?.let { Locale.forLanguageTag(it) } ?: BASE_LOCALE

    private val l = Logger.getLogger(Translate::class.java.name)

    private val TRANSLATIONS = loadTranslationResources()

    val locales
        get() = TRANSLATIONS.keys

    private fun loadTranslationResources(): Map<Locale, Map<String, *>> {
        val translationsByLanguageTag = HashMap<String, HashMap<String, *>>()

        val i18nDir = File(WebServerUtils.resourceDirectory, "i18n")
        val ymlFiles = i18nDir.listFiles()

        for (ymlFile in ymlFiles) {
            try {
                val yaml = Yaml(Constructor(HashMap::class.java))
                deepMerge(translationsByLanguageTag, yaml.load(ymlFile.inputStream()))
            } catch (e: FileNotFoundException) {
                l.log(Level.SEVERE, "Error loading translation", e)
                throw e
            }
        }

        return translationsByLanguageTag.mapKeys { Locale.forLanguageTag(it.key) }
    }

    private fun getTranslationsFor(locale: Locale): Map<String, *>? {
        return TRANSLATIONS[locale]
            ?: error("No locale matching given locale: " + locale.toLanguageTag() + " found")
    }

    private fun translate(key: String, locale: Locale, azzertIfInvalid: Boolean): String? {
        var translation: Any? = getTranslationsFor(locale)

        val parts = key.split("\\.".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()

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

    fun translate(key: String, locale: Locale, substitutions: MutableMap<String, String> = HashMap()): String {
        // Attempt to translate in the given locale.
        var translation = translate(key, locale, false)

        if (translation == null) {
            // If we couldn't find a translation in the given locale, fall back to the base locale.
            translation = translate(key, BASE_LOCALE, true)
        }

        translation = interpolate(translation, substitutions)
        return translation
    }

    // Interpolate translation keys in the same way Ruby on Rails does.
    // See: http://guides.rubyonrails.org/i18n.html#passing-variables-to-translations
    private fun interpolate(interpolateMe: String?, substitutions: Map<String, String>): String {
        // Copy the given Map, as we're going to mutate it later on.
        val mutateSubstitutions = substitutions.toMutableMap()

        // Now interpolate variables in the input string.
        //
        // Find anything that looks like %{...}, unless the percent sign is escaped as in %%{...}
        val templatePattern = Pattern.compile("(?<!%)%\\{([^}]+)\\}")
        val matcher = templatePattern.matcher(interpolateMe)

        val sb = StringBuffer()

        while (matcher.find()) {
            val key = matcher.group(1)

            val replacement = mutateSubstitutions.remove(key)
                ?: error(String.format("Substitution for key: %s not found", key))

            matcher.appendReplacement(sb, replacement)
        }

        matcher.appendTail(sb)
        assert(mutateSubstitutions.isEmpty()) { String.format("Unused substitution values: %s", substitutions.keys) }

        return sb.toString()
    }

    // Copied from https://gist.github.com/aslakhellesoy/3858814
    private fun deepMerge(original: MutableMap<*, *>, newMap: Map<*, *>): Map<*, *> {
        for ((key, newChild) in newMap) {
            val originalChild = original[key]

            if (newChild is Map<*, *> && originalChild is Map<*, *>) {
                original[key] = deepMerge(originalChild.toMutableMap(), newChild)
            } else {
                original[key] = newMap[key]
            }
        }

        return original
    }
}
