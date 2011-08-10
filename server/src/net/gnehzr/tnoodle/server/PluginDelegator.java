package net.gnehzr.tnoodle.server;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import net.gnehzr.tnoodle.utils.Utils;

import com.sun.net.httpserver.HttpExchange;

public class PluginDelegator extends SafeHttpHandler {
	private static final Pattern NAMESPACE_PATTERN = Pattern.compile("([^\\s{]+)\\s*\\{\\s*");
	
	public PluginDelegator() {
		
	}
	private LongestPrefixMatch<String> lpm = new LongestPrefixMatch<String>();
	private HashMap<String[], LazyClassLoader<SafeHttpHandler>> handlers = 
		new HashMap<String[], LazyClassLoader<SafeHttpHandler>>();
	private long loadedTime = 0;
	private String[] getLongestMatch(String[] path) throws IOException, IllegalArgumentException, InstantiationException, IllegalAccessException, InvocationTargetException, BadClassDescriptionException, SecurityException, NoSuchMethodException, ClassNotFoundException {
		File contextFile = new File(Utils.getProgramDirectory(), "serverPlugins/context");
		assert contextFile.exists(); // TODO - turn on assertions at runtime?
		long mtime = contextFile.lastModified();
		if(mtime > loadedTime) {
			// If the context file has changed, we force reloading of *all*
			// scramble plugins by forgetting what we've loaded. 
			// TODO - verify that this actually cleans up stuff that spawns new threads! i kinda doubt it does... =(
			lpm.clear();
			handlers.clear();
			BufferedReader in = new BufferedReader(new FileReader(contextFile));
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
				
				String[] prefix_handlerDef = line.split("\\s+", 2);
				assert prefix_handlerDef.length == 2;
				if(prefix_handlerDef[0].startsWith("/")) {
					prefix_handlerDef[0] = prefix_handlerDef[0].substring(1);
				}
				if(prefix_handlerDef[0].endsWith("/")) {
					prefix_handlerDef[0] = prefix_handlerDef[0].substring(0, prefix_handlerDef[0].length()-1);
				}
				String[] prefix;
				if(prefix_handlerDef[0].isEmpty()) {
					prefix = new String[0];
				} else {
					prefix = prefix_handlerDef[0].split("/");
				}
				String handlerDef = prefix_handlerDef[1];
				LazyClassLoader<SafeHttpHandler> lazyClass = new LazyClassLoader<SafeHttpHandler>(handlerDef, SafeHttpHandler.class);
				lpm.put(prefix);
				handlers.put(prefix, lazyClass);
				lazyClass.cachedInstance();
			}
			loadedTime = mtime;
		}
		
		String[] longestMatch = lpm.get(path);
		return longestMatch;
	}
	
	@Override
	protected void wrappedHandle(HttpExchange t, String[] path, HashMap<String, String> query) throws Exception {
		String[] longestMatch = getLongestMatch(path);
		LazyClassLoader<SafeHttpHandler> handler = handlers.get(longestMatch);
		int startIndex = longestMatch.length;
		String[] truncatedPath = Arrays.copyOfRange(path, startIndex, path.length);
		handler.cachedInstance().wrappedHandle(t, truncatedPath, query);
	}

}
