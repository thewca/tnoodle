package net.gnehzr.tnoodle.utils;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static net.gnehzr.tnoodle.utils.Utils.azzert;

public class Plugins<H> {
	private static final Pattern NAMESPACE_PATTERN = Pattern.compile("([^\\s{]+)\\s*\\{\\s*");
	
	private String packageName;
	private HashMap<String, LazyInstance<H>> filePlugins = new HashMap<String, LazyInstance<H>>();
	private long loadedTime = 0;
	private Class<H> pluginClass;
	
	private String PLUGIN_DEFINITIONS_FILENAME;
	private File contextFile;
	private File pluginDirectory;
	public Plugins(String packageName, Class<H> pluginClass) {
		this.packageName = packageName;
		this.PLUGIN_DEFINITIONS_FILENAME = packageName + "s";
		this.pluginClass = pluginClass;
		pluginDirectory = new File(Utils.getResourceDirectory(), this.packageName);
		azzert(pluginDirectory.exists());
		contextFile = new File(pluginDirectory, PLUGIN_DEFINITIONS_FILENAME);
		azzert(contextFile.exists());
	}
	
	private HashMap<String, LazyInstance<H>> allPlugins = new HashMap<String, LazyInstance<H>>();
	public synchronized boolean dirtyPlugins() {
		azzert(contextFile.exists());
		long mtime = contextFile.lastModified();
		return mtime > loadedTime;
	}
	
	public File getPluginDirectory() {
		return pluginDirectory;
	}
	
	private void readContextFile(BufferedReader in, HashMap<String, LazyInstance<H>> loadMe) throws BadClassDescriptionException, IOException {
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
				// We don't support nested namespaces yet
				azzert(namespace == null);
				namespace = m.group(1);
			}
			if(line.equals("}")) {
				// Closing curly brace found without matching opening brace
				azzert(namespace != null);
				namespace = null;
			}

			String[] name_def = line.split("\\s+", 2);
			String name = name_def[0];
			String definition = name_def[1];
			LazyInstance<H> lazyClass = new LazyInstance<H>(definition, pluginClass, Utils.getResourceDirectory());
			azzert(!loadMe.containsKey(name));
			loadMe.put(name, lazyClass);
		}
	}
	
	public synchronized void reloadPlugins() throws BadClassDescriptionException, IOException {
		azzert(contextFile.exists());
		filePlugins.clear();
		BufferedReader in = new BufferedReader(new FileReader(contextFile));
		readContextFile(in, filePlugins);
		loadedTime = contextFile.lastModified();

		allPlugins.clear();
		allPlugins.putAll(filePlugins);
	}

	public synchronized HashMap<String, LazyInstance<H>> getPlugins() throws BadClassDescriptionException, IOException {
		if(dirtyPlugins()) {
			reloadPlugins();
		}
		return new HashMap<String, LazyInstance<H>>(allPlugins);
	}

}
