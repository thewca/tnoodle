package net.gnehzr.tnoodle.utils;

import static net.gnehzr.tnoodle.utils.Utils.azzert;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class Plugins<H> {
	private String packageName;
	private HashMap<String, LazyInstantiator<H>> filePlugins = new HashMap<String, LazyInstantiator<H>>();
	private HashMap<String, String> pluginComment = new HashMap<String, String>();
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
	
	private boolean dirtyPlugins() {
		azzert(contextFile.exists());
		long mtime = contextFile.lastModified();
		return mtime > loadedTime;
	}
	
	public File getPluginDirectory() {
		return pluginDirectory;
	}
	
	private void reloadPlugins() throws BadClassDescriptionException, IOException {
		azzert(contextFile.exists());
		BufferedReader in = new BufferedReader(new FileReader(contextFile));
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
			LazyInstantiator<H> lazyClass = new LazyInstantiator<H>(definition, pluginClass, Utils.getResourceDirectory());
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
		loadedTime = contextFile.lastModified();
	}
	
	public String getPluginComment(String key) {
		return pluginComment.get(key);
	}

	public boolean reloadIfNeeded() throws BadClassDescriptionException, IOException {
		if(dirtyPlugins()) {
			synchronized(this) {
				if(dirtyPlugins()) {
					reloadPlugins();
					return true;
				}
			}
		}
		return false;
	}

	public Map<String, LazyInstantiator<H>> getPlugins() throws BadClassDescriptionException, IOException {
		reloadIfNeeded();
		return Collections.unmodifiableMap(filePlugins);
	}

}
