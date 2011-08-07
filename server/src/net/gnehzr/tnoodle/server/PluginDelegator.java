package net.gnehzr.tnoodle.server;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;

import net.gnehzr.tnoodle.utils.Utils;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

public class PluginDelegator extends SafeHttpHandler {
	
	public PluginDelegator() {
		
	}
	private LongestPrefixMatchMap<String, LazyClassLoader<HttpHandler>> context =
		new LongestPrefixMatchMap<String, LazyClassLoader<HttpHandler>>();
	private long loadedTime = 0;
	private HttpHandler getHandler(String[] path) throws IOException, IllegalArgumentException, InstantiationException, IllegalAccessException, InvocationTargetException, BadClassDescriptionException, SecurityException, NoSuchMethodException, ClassNotFoundException {
		File contextFile = new File(Utils.getProgramDirectory(), "serverPlugins/context");
		assert contextFile.exists(); // TODO - turn on assertions at runtime?
		long mtime = contextFile.lastModified();
		if(mtime > loadedTime) {
			// TODO - reread context file!
			// If the context file has changed, we force reloading of *all*
			// scramble plugins by forgetting what we've loaded. 
			// TODO - verify that this actually cleans up stuff that spawns new threads! i kinda doubt it does... =(
			context.clear();
			BufferedReader in = new BufferedReader(new FileReader(contextFile));
			String line;
			while((line = in.readLine()) != null) {
				if(line.startsWith("#")) {
					continue;
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
				LazyClassLoader<HttpHandler> lazyClass = new LazyClassLoader<HttpHandler>(handlerDef, HttpHandler.class);
				context.put(prefix, lazyClass);
			}
			loadedTime = mtime;
		}
		
		LazyClassLoader<HttpHandler> bestMatch = context.get(path);
		return bestMatch.cachedInstance();
	}
	
	@Override
	protected void wrappedHandle(HttpExchange t, String[] path, HashMap<String, String> query) throws Exception {
		getHandler(path).handle(t);
	}

}
