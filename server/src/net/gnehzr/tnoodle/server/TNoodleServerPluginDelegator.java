package net.gnehzr.tnoodle.server;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.logging.Logger;

import net.gnehzr.tnoodle.utils.BadClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyInstance;
import net.gnehzr.tnoodle.utils.Plugins;
import net.gnehzr.tnoodle.utils.TimedLogRecordStart;

import com.sun.net.httpserver.HttpExchange;

public class TNoodleServerPluginDelegator extends SafeHttpHandler {
	private static final Logger l = Logger.getLogger(TNoodleServerPluginDelegator.class.getName());
	
	private Plugins<SafeHttpHandler> plugins;
	public TNoodleServerPluginDelegator() {
		plugins = new Plugins<SafeHttpHandler>("tnoodleServerHandler", SafeHttpHandler.class);
	}
	
	private LongestPrefixMatch<String> lpm = new LongestPrefixMatch<String>();
	private HashMap<String[], LazyInstance<SafeHttpHandler>> handlers = 
		new HashMap<String[], LazyInstance<SafeHttpHandler>>();
	private String[] getLongestMatch(String[] path) throws IOException, IllegalArgumentException, InstantiationException, IllegalAccessException, InvocationTargetException, SecurityException, NoSuchMethodException, ClassNotFoundException, BadClassDescriptionException {
		if(plugins.dirtyPlugins()) {
			plugins.reloadPlugins();
			HashMap<String, LazyInstance<SafeHttpHandler>> pluginMap = plugins.getPlugins();
			for(String prefix : pluginMap.keySet()) {
				LazyInstance<SafeHttpHandler> lazyClass = pluginMap.get(prefix);
				
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
			}
		}
		
		String[] longestMatch = lpm.get(path);
		return longestMatch;
	}
	
	@Override
	protected void wrappedHandle(HttpExchange t, String[] path, LinkedHashMap<String, String> query) throws Exception {
		l.info("GET " + t.getRequestURI() + " " + t.getRemoteAddress()); // TODO - create a special logger for this!
		
		String[] longestMatch = getLongestMatch(path);
		LazyInstance<SafeHttpHandler> handler = handlers.get(longestMatch);
		if(handler == null) {
			String failMessage = "No handler found for: " + Arrays.toString(path);
			l.info(failMessage);
			sendText(t, failMessage);
			return;
		}
		
		TimedLogRecordStart start = new TimedLogRecordStart("calling " + handler);
		l.log(start);
		
		int startIndex = longestMatch.length;
		String[] truncatedPath = Arrays.copyOfRange(path, startIndex, path.length);
		handler.cachedInstance().wrappedHandle(t, truncatedPath, query);
		
		l.log(start.finishedNow());
	}

}
