package net.gnehzr.tnoodle.server.webscrambles;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.util.HashMap;
import java.util.Map;
import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Set;

import net.gnehzr.tnoodle.utils.EnvGetter;
import net.gnehzr.tnoodle.utils.Utils;

import org.yaml.snakeyaml.constructor.Constructor;
import org.yaml.snakeyaml.Yaml;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

public class Translate {
    private Translate() {}

    private static final Logger l = Logger.getLogger(Translate.class.getName());
    private static final Locale BASE_LOCALE = Locale.forLanguageTag("en");
    public static final Locale DEFAULT_LOCALE = Locale.forLanguageTag(EnvGetter.getenv("TNOODLE_DEFAULT_LOCALE", BASE_LOCALE.toLanguageTag()));

    private static final HashMap<Locale, HashMap<String, ?>> TRANSLATIONS = new HashMap<Locale, HashMap<String, ?>>();
    static {
        HashMap<String, HashMap<String, ?>> translationsByLanguageTag = new HashMap<String, HashMap<String, ?>>();
        File i18nDir = new File(Utils.getResourceDirectory(), "i18n");
        File[] ymlFiles = i18nDir.listFiles();
        for(File ymlFile : ymlFiles) {
            HashMap<String, ?> data = null;
            try {
                Yaml yaml = new Yaml(new Constructor(HashMap.class));
                deepMerge(translationsByLanguageTag, yaml.load(new FileInputStream(ymlFile)));
            } catch(FileNotFoundException e) {
                l.log(Level.SEVERE, "Error loading translation", e);
                azzert(false);
            }
        }

        for(String languageTag : translationsByLanguageTag.keySet()) {
            Locale locale = Locale.forLanguageTag(languageTag);

            TRANSLATIONS.put(locale, translationsByLanguageTag.get(languageTag));
        }
    }

    public static Set<Locale> getLocales() {
        return TRANSLATIONS.keySet();
    }

    private static HashMap<String, ?> getTranslationsFor(Locale locale) {
        HashMap<String, ?> translations = TRANSLATIONS.get(locale);
        azzert(translations != null, "No locale matching given locale: " + locale.toLanguageTag() + " found");
        return translations;
    }

    @SuppressWarnings("unchecked")
    private static String translate(String key, Locale locale, boolean azzertIfInvalid) {
        Object translation = getTranslationsFor(locale);

        String[] parts = key.split("\\.");
        for(String part : parts) {
            if(!(translation instanceof HashMap)) {
                if(azzertIfInvalid) {
                    azzert(false, locale.toLanguageTag() + " couldn't find part " + part + " of " + key);
                } else {
                    return null;
                }
            }

            translation = ((HashMap<String, ?>) translation).get(part);
        }

        if(translation == null) {
            if(azzertIfInvalid) {
                azzert(false, locale.toLanguageTag() + " translation key " + key + " not found");
            } else {
                return null;
            }
        }

        if(!(translation instanceof String)) {
            if(azzertIfInvalid) {
                azzert(false, locale.toLanguageTag() + " translation key " + key + " is of type " + translation.getClass() + ", but we were expecting String.");
            } else {
                return null;
            }
        }

        return (String) translation;
    }

    public static String translate(String key, Locale locale) {
        return translate(key, locale, new HashMap<String, String>());
    }

    public static String translate(String key, Locale locale, Map<String, String> substitutions) {
        // Attempt to translate in the given locale.
        String translation = translate(key, locale, false);
        if(translation == null) {
            // If we couldn't find a translation in the given locale, fall back to the base locale.
            translation = translate(key, BASE_LOCALE, true);
        }

        translation = interpolate(translation, substitutions);
        return translation;
    }

    // Interpolate translation keys in the same way Ruby on Rails does.
    // See: http://guides.rubyonrails.org/i18n.html#passing-variables-to-translations
    private static String interpolate(String interpolateMe, Map<String, String> substitutions) {
        // Copy the given Map, as we're going to mutate it later on.
        substitutions = new HashMap<String, String>(substitutions);

        // Now interpolate variables in the input string.
        //
        // Find anything that looks like %{...}, unless the percent sign is escaped as in %%{...}
        Pattern templatePattern = Pattern.compile("(?<!%)%\\{([^}]+)\\}");
        Matcher matcher = templatePattern.matcher(interpolateMe);
        StringBuffer sb = new StringBuffer();
        while(matcher.find()) {
            String key = matcher.group(1);
            String replacement = substitutions.remove(key);
            azzert(replacement != null, String.format("Substitution for key: %s not found", key));
            matcher.appendReplacement(sb, replacement);
        }
        matcher.appendTail(sb);
        azzert(substitutions.size() == 0, String.format("Unused substitution values: %s", substitutions.keySet()));
        return sb.toString();
    }

    // Copied from https://gist.github.com/aslakhellesoy/3858814
    @SuppressWarnings({"unchecked", "rawtypes"})
    private static final Map deepMerge(Map original, Map newMap) {
        for(Object key : newMap.keySet()) {
            if(newMap.get(key) instanceof Map && original.get(key) instanceof Map) {
                Map originalChild = (Map) original.get(key);
                Map newChild = (Map) newMap.get(key);
                original.put(key, deepMerge(originalChild, newChild));
            } else {
                original.put(key, newMap.get(key));
            }
        }
        return original;
    }
}
