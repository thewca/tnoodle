package net.gnehzr.tnoodle.utils;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Plugins<H> {
	private static final String PLUGIN_DEFINITIONS_FILENAME = "pluginDefinitions";
	private static final Pattern NAMESPACE_PATTERN = Pattern.compile("([^\\s{]+)\\s*\\{\\s*");
	
	private String packageName;
	private HashMap<String, LazyClassLoader<H>> filePlugins = new HashMap<String, LazyClassLoader<H>>();
	private long loadedTime = 0;
	private Class<H> pluginClass;
	
	private String contextResourcePath;
	private File contextFile;
	public Plugins(String packageName, Class<H> pluginClass) {
		this.packageName = packageName;
		this.pluginClass = pluginClass;
		this.contextResourcePath = "/" + this.packageName + "/" + PLUGIN_DEFINITIONS_FILENAME;
		contextFile = new File(Utils.getProgramDirectory(), this.packageName + "/" + PLUGIN_DEFINITIONS_FILENAME);
	}
	
	private HashMap<String, LazyClassLoader<H>> allPlugins = new HashMap<String, LazyClassLoader<H>>();
	private HashMap<String, LazyClassLoader<H>> jarredPlugins = null;
	public synchronized boolean dirtyPlugins() {
		if(jarredPlugins == null) {
			return true;
		}
		if(contextFile.exists()) {
			long mtime = contextFile.lastModified();
			return mtime > loadedTime;
		}
		return false;
	}
	
	private void readContextFile(BufferedReader in, HashMap<String, LazyClassLoader<H>> loadMe) throws BadClassDescriptionException, IOException {
		String line;
		String namespace = null;
		while((line = in.readLine()) != null) {
			line = line.trim();
			// lines starting with # and empty lines are ignored
			if(line.startsWith("#") || line.isEmpty()) {
				continue;
			}

			Matcher m = NAMESPACE_PATTERN.matcher(line);
			if(m.matches()) {
				assert namespace == null : "Nested namespaces not yet supported";
				namespace = m.group(1);
			}
			if(line.equals("}")) {
				assert namespace != null : "Closing curly brace found without matching opening brace";
				namespace = null;
			}

			String[] name_def = line.split("\\s+", 2);
			String name = name_def[0];
			String definition = name_def[1];
			LazyClassLoader<H> lazyClass = new LazyClassLoader<H>(definition, pluginClass);
			assert !loadMe.containsKey(name);
			loadMe.put(name, lazyClass);
		}
	}
	
	public synchronized void reloadPlugins() throws BadClassDescriptionException, IOException {
		if(jarredPlugins == null) {
			jarredPlugins = new HashMap<String, LazyClassLoader<H>>();
		}
		jarredPlugins.clear();
		// TODO - test that this all works while inside of an applet
		InputStream is = Plugins.class.getResourceAsStream(contextResourcePath);
		assert is != null || contextFile.exists() : "No plugin file found (" + contextResourcePath + " or " + contextFile + ")";
		if(is != null) {
			//TODO
			BufferedReader in = new BufferedReader(new InputStreamReader(is));
			readContextFile(in, jarredPlugins);
		}

		filePlugins.clear();
		if(contextFile.exists()) {
			BufferedReader in = new BufferedReader(new FileReader(contextFile));
			readContextFile(in, filePlugins);
			loadedTime = contextFile.lastModified();
		}

		allPlugins.clear();
		// Note that filePlugins take precedence over jarred plugins
		allPlugins.putAll(jarredPlugins);
		allPlugins.putAll(filePlugins);
	}

	public synchronized HashMap<String, LazyClassLoader<H>> getPlugins() throws BadClassDescriptionException, IOException {
		if(dirtyPlugins()) {
			reloadPlugins();
		}
		return new HashMap<String, LazyClassLoader<H>>(allPlugins);
	}
}
