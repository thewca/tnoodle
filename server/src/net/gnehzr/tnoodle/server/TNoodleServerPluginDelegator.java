package net.gnehzr.tnoodle.server;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.logging.Logger;

import net.gnehzr.tnoodle.utils.BadClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyInstantiator;
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
	private Map<String[], LazyInstantiator<SafeHttpHandler>> handlers = new HashMap<String[], LazyInstantiator<SafeHttpHandler>>();
	private synchronized void reloadIfNeeded() throws IOException, IllegalArgumentException, InstantiationException, IllegalAccessException, InvocationTargetException, SecurityException, NoSuchMethodException, ClassNotFoundException, BadClassDescriptionException {
        if(plugins.reloadIfNeeded()) {
			LongestPrefixMatch<String> lpm = new LongestPrefixMatch<String>();
			Map<String[], LazyInstantiator<SafeHttpHandler>> handlers = 
				new HashMap<String[], LazyInstantiator<SafeHttpHandler>>();
			Map<String, LazyInstantiator<SafeHttpHandler>> pluginMap = plugins.getPlugins();
			for(String prefix : pluginMap.keySet()) {
				LazyInstantiator<SafeHttpHandler> lazyClass = pluginMap.get(prefix);

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
			this.handlers = handlers;
			this.lpm = lpm;
        }
	}
	
	@Override
	protected void wrappedHandle(HttpExchange t, String[] path, LinkedHashMap<String, String> query) throws Exception {
		l.info(t.getRequestMethod() + " " + t.getRequestURI() + " " + t.getRemoteAddress()); // TODO - create a special logger for this!
		
		reloadIfNeeded();
		String[] longestMatch = lpm.get(path);
		LazyInstantiator<SafeHttpHandler> handler = handlers.get(longestMatch);
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
