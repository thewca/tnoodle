package net.gnehzr.tnoodle.utils;

import static net.gnehzr.tnoodle.utils.Utils.azzert;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class Plugins<H> {
    private HashMap<String, LazyInstantiator<H>> filePlugins = new HashMap<String, LazyInstantiator<H>>();
    private HashMap<String, String> pluginComment = new HashMap<String, String>();
    public Plugins(String packageName, Class<H> pluginClass, ClassLoader classLoader) throws IOException, BadClassDescriptionException {
        if(classLoader == null) {
            classLoader = getClass().getClassLoader();
        }

        String pluginDefinitionsFilename = packageName + "/" + packageName + "s";
        InputStream is = classLoader.getResourceAsStream(pluginDefinitionsFilename);
        azzert(is != null);
        BufferedReader in = new BufferedReader(new InputStreamReader(is));
        HashMap<String, LazyInstantiator<H>> newFilePlugins = new HashMap<String, LazyInstantiator<H>>();
        HashMap<String, String> newPluginComment = new HashMap<String, String>();

        String line;
        String lastComment = null;
        while((line = in.readLine()) != null) {
            line = line.trim();
            // lines starting with # and empty lines are ignored
            if(line.startsWith("#")) {
                lastComment = line.substring(1);
                continue;
            }
            if(line.isEmpty()) {
                lastComment = null;
                continue;
            }

            String[] name_def = line.split("\\s+", 2);
            String name = name_def[0];
            String definition = name_def[1];
            LazyInstantiator<H> lazyClass = new LazyInstantiator<H>(definition, pluginClass, classLoader);
            // Note that we may be clobbering something already in newFilePlugins,
            // this is ok. Consider a project B that uses project A,
            // this way, project B can clobber project A's settings.
            newFilePlugins.put(name, lazyClass);
            newPluginComment.put(name, lastComment != null ? lastComment : name);
            lastComment = null;
        }
        in.close();

        filePlugins = newFilePlugins;
        pluginComment = newPluginComment;
    }

    public String getPluginComment(String key) {
        return pluginComment.get(key);
    }

    public Map<String, LazyInstantiator<H>> getPlugins() throws BadClassDescriptionException, IOException {
        return Collections.unmodifiableMap(filePlugins);
    }
}
