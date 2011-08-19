package net.gnehzr.tnoodle.server;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.HashMap;

import net.gnehzr.tnoodle.utils.BadClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyClassLoader;
import net.gnehzr.tnoodle.utils.Plugins;

import com.sun.net.httpserver.HttpExchange;

public class TnoodleServerPluginDelegator extends SafeHttpHandler {
	private Plugins<SafeHttpHandler> plugins;
	public TnoodleServerPluginDelegator() {
		plugins = new Plugins<SafeHttpHandler>("serverPlugins", SafeHttpHandler.class);
	}
	
	private LongestPrefixMatch<String> lpm = new LongestPrefixMatch<String>();
	private HashMap<String[], LazyClassLoader<SafeHttpHandler>> handlers = 
		new HashMap<String[], LazyClassLoader<SafeHttpHandler>>();
	private String[] getLongestMatch(String[] path) throws IOException, IllegalArgumentException, InstantiationException, IllegalAccessException, InvocationTargetException, SecurityException, NoSuchMethodException, ClassNotFoundException, BadClassDescriptionException {
		if(plugins.dirtyPlugins()) {
			plugins.reloadPlugins();
			HashMap<String, LazyClassLoader<SafeHttpHandler>> pluginMap = plugins.getPlugins();
			for(String prefix : pluginMap.keySet()) {
				LazyClassLoader<SafeHttpHandler> lazyClass = pluginMap.get(prefix);
				
				if(prefix.startsWith("/")) {
					prefix = prefix.substring(1);
				}
				if(prefix.endsWith("/")) {
					prefix = prefix.substring(0, prefix.length()-1);
				}
				String[] prefixArray;
				if(prefix.isEmpty()) {
					prefixArray = new String[0];
				} else {
					prefixArray = prefix.split("/");
				}
				lpm.put(prefixArray);
				handlers.put(prefixArray, lazyClass);
				lazyClass.cachedInstance();
			}
		}
		
		String[] longestMatch = lpm.get(path);
		return longestMatch;
	}
	
	@Override
	protected void wrappedHandle(HttpExchange t, String[] path, HashMap<String, String> query) throws Exception {
		String[] longestMatch = getLongestMatch(path);
		LazyClassLoader<SafeHttpHandler> handler = handlers.get(longestMatch);
		if(handler == null) {
			sendText(t, "No handler found for: " + Arrays.toString(path));
			return;
		}
		int startIndex = longestMatch.length;
		String[] truncatedPath = Arrays.copyOfRange(path, startIndex, path.length);
		handler.cachedInstance().wrappedHandle(t, truncatedPath, query);
	}

}
