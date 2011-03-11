package net.gnehzr.tnoodle.server;

import static net.gnehzr.tnoodle.utils.Utils.GSON;
import static net.gnehzr.tnoodle.utils.Utils.fullyReadInputStream;

import java.awt.Desktop;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.BindException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.activation.MimetypesFileTypeMap;

import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

public class TNoodleServer {
	public static String NAME, VERSION;
	static {
		Package p = TNoodleServer.class.getPackage();

		NAME = p.getImplementationTitle();
		if(NAME == null) {
			NAME = TNoodleServer.class.getName();
		}
		VERSION = p.getImplementationVersion();
		if(VERSION == null) {
			VERSION = "devel";
		}
	}
	
	// TODO - check that the directories in www don't conflict with
	// the other root "directories" we're defining here
	private static HashMap<String, HttpHandler> pathHandlers = new HashMap<String, HttpHandler>();
	static {
		pathHandlers.put("/", new FileHandler());
		pathHandlers.put("/kill/", new DeathHandler());

		// Stateless scramble handlers
		pathHandlers.put("/import/", new ImporterHandler());
		pathHandlers.put("/scramble/", new ScrambleHandler());
		pathHandlers.put("/view/", new ScrambleViewHandler());
		
		// Stateful account/times management
		// TODO - plan API before trying to implement it, lol
		// What's needed?
		//
		// Account
		//  -login
		//  -get/set settings
		//  -upload background =)
		//
		// Sessions
		//  -get latest session of an event
		//  	-integrate w/ Querying somehow?
		//  -delete
		//  -create
		//  -edit
		//  	-comments
		//  	-change puzzle/event
		//
		// Events
		// 	-create/edit/delete?
		//
		// Times
		// 	-add
		// 	-edit (comment, penalize, tag)
		// 	-delete
		//
		// Querying
		// 	-awesomness! -> be able to open old sessions?
		//
		pathHandlers.put("/login", new ScrambleViewHandler());
		//TODO - get & set
		pathHandlers.put("/settings", new ScrambleViewHandler());
		//TODO 
		pathHandlers.put("/times/get/lastSession", new ScrambleViewHandler());
		//TODO =)
		pathHandlers.put("/times/get/query", new ScrambleViewHandler());
		pathHandlers.put("/times/set", new ScrambleViewHandler());
	}
	
	//TODO - it would be nice to kill threads when the tcp connection is killed, not sure if this is possible, though
	public TNoodleServer(int port, File scrambleFolder, boolean browse) throws IOException {
		HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
		
		for(String path : pathHandlers.keySet()) {
			server.createContext(path, pathHandlers.get(path));
		}

		server.setExecutor(Executors.newCachedThreadPool());
		server.start();
		
		String addr = InetAddress.getLocalHost().getHostAddress() + ":" + port;
		System.out.println(NAME + "-" + VERSION + " started on " + addr);
		String url = "http://" + addr;
		//TODO - maybe it would make sense to open this url asap, that
		//       way the user's browser starts parsing tnt even as scramble
		//       plugins are being loaded
		if(browse) {
			if(Desktop.isDesktopSupported()) {
				Desktop d = Desktop.getDesktop();
				if(d.isSupported(Desktop.Action.BROWSE)) {
					try {
						URI uri = new URI(url);
						System.out.println("Opening " + uri + " in browser. Pass -n to disable this!");
						d.browse(uri);
						return;
					} catch(URISyntaxException e) {
						e.printStackTrace();
					}
				}
			}
			System.out.println("Sorry, it appears the Desktop api is not supported on your platform");
		}
		
		System.out.println("Visit " + url + " for a readme and demo.");
	}
	
	private static class DeathHandler extends SafeHttpHandler {
		public DeathHandler() { }
		
		protected void wrappedHandle(HttpExchange t, String path[], HashMap<String, String> query) throws IOException {
			if(path.length == 2 && path[1].equals("now")) {
				// If localhost makes a request to
				// http://localhost:PORT/kill/now
				// that's enough for us to commit honorable suicide.
				String remote = t.getRemoteAddress().getAddress().getHostAddress();
				System.out.print("Asked to kill myself by " + remote + "...");
				if(remote.equals("127.0.0.1")) {
					// Only kill ourselves if someone on this machine requested it
					sendText(t, "Nice knowing ya'!");
					System.out.println("committing suicide");
					System.exit(0);
				}
				System.out.println("ignoring request");
			}
			sendText(t, NAME + "-" + VERSION);
		}
	}

	private static class FileHandler extends SafeHttpHandler {
		MimetypesFileTypeMap mimes = new MimetypesFileTypeMap();
		{
			mimes.addMimeTypes("text/css css");
			mimes.addMimeTypes("text/html html htm");
			mimes.addMimeTypes("text/plain txt");
			
			mimes.addMimeTypes("image/png png");
			mimes.addMimeTypes("image/gif gif");
			mimes.addMimeTypes("image/vnd.microsoft.icon ico");

			mimes.addMimeTypes("application/x-font-ttf ttf");

			mimes.addMimeTypes("application/x-javascript js");
			mimes.addMimeTypes("application/json json");
			mimes.addMimeTypes("application/octet-stream *");
		}
		
		protected void wrappedHandle(HttpExchange t, String[] path, HashMap<String, String> query) throws IOException {
			ByteArrayOutputStream bytes = new ByteArrayOutputStream();
			String fileName = t.getRequestURI().getPath().substring(1);
			if(fileName.isEmpty() || fileName.endsWith("/"))
				fileName += "index.html";
			else {
				// It's impossible to check if a URI (what getResource() returns) is a directory,
				// so we rely upon appending /index.html and checking if that path exists. If it does
				// we redirect the browser to the given path with a trailing / appended.
				boolean isDir = getClass().getResource("/www/" + fileName + "/index.html") != null;
				if(isDir) {
					sendTrailingSlashRedirect(t);
					return;
				}
			}
			InputStream is = getClass().getResourceAsStream("/www/" + fileName);
			if(is == null) {
				send404(t, fileName);
				return;
			}
			fullyReadInputStream(is, bytes);
			sendBytes(t, bytes, mimes.getContentType(fileName));
		}
	}
	
	private static class ImporterHandler extends SafeHttpHandler {
		private final Pattern BOUNDARY_PATTERN = Pattern.compile("^.+boundary\\=(.+)$");
		@Override
		protected void wrappedHandle(HttpExchange t, String[] path, HashMap<String, String> query) throws Exception {
			if(t.getRequestMethod().equals("POST")) {
				// we assume this means we're uploading a file
				// the following isn't terribly robust, but it should work for us
				String boundary = t.getRequestHeaders().get("Content-Type").get(0);
				Matcher m = BOUNDARY_PATTERN.matcher(boundary);
				m.matches();
				boundary = "--" + m.group(1);
				
				BufferedReader in = new BufferedReader(new InputStreamReader(t.getRequestBody()));
				ArrayList<String> scrambles = new ArrayList<String>();
				String line;
				boolean finishedHeaders = false;
				while((line = in.readLine()) != null) {
					if(line.equals(boundary + "--"))
						break;
					if(finishedHeaders)
						scrambles.add(line);
					if(line.isEmpty()) //this indicates a CRLF CRLF
						finishedHeaders = true;
				}
				//we need to escape our backslashes
				String json = GSON.toJson(scrambles).replaceAll("\\\\", Matcher.quoteReplacement("\\\\"));
				ByteArrayOutputStream bytes = new ByteArrayOutputStream();
				BufferedWriter html = new BufferedWriter(new OutputStreamWriter(bytes));
				html.append("<html><body><script>parent.postMessage('");
				html.append(json);
				html.append("', '*');</script></html>");
				html.close();
				sendHtml(t, bytes);
			} else {
				String urlStr = query.get("url");
				if(!urlStr.startsWith("http")) //might as well give it our best shot
					urlStr = "http://" + urlStr;
				URL url = new URL(urlStr);
				URLConnection conn = url.openConnection();
				ArrayList<String> scrambles = new ArrayList<String>();
				BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
				String line;
				while((line = in.readLine()) != null) {
					scrambles.add(line);
				}
				sendJSON(t, GSON.toJson(scrambles), query.get("callback"));
			}
		}
	}
	


	/**
	 * @return A File representing the directory in which this program resides.
	 * If this is a jar file, this should be obvious, otherwise things are a little ambiguous.
	 */
	public static File getProgramDirectory() {
		File defaultScrambleFolder;
		try {
			defaultScrambleFolder = new File(TNoodleServer.class.getProtectionDomain().getCodeSource().getLocation().toURI().getPath());
		} catch (URISyntaxException e) {
			return new File(".");
		}
		if(defaultScrambleFolder.isFile()) //this should indicate a jar file
			defaultScrambleFolder = defaultScrambleFolder.getParentFile();
		return defaultScrambleFolder;
	}

	public static void main(String[] args) throws IOException {
		Launcher.wrapMain(args);

		OptionParser parser = new OptionParser();
		// TODO - optional url prefix?
		OptionSpec<Integer> portOpt = parser.acceptsAll(Arrays.asList("p", "port"), "The port to run the http server on").withOptionalArg().ofType(Integer.class).defaultsTo(80);
		OptionSpec<File> scrambleFolderOpt = parser.accepts("scramblers", "The directory of the scramble plugins").withOptionalArg().ofType(File.class).defaultsTo(new File(getProgramDirectory(), "scramblers"));
		OptionSpec<?> noBrowserOpt = parser.acceptsAll(Arrays.asList("n", "nobrowser"), "Don't open the browser when starting the server");
		OptionSpec<?> noUpgradeOpt = parser.acceptsAll(Arrays.asList("u", "noupgrade"), "If an instance of " + NAME + " is running on the desired port, do not attempt to kill it and start up");
		OptionSpec<?> cgiOpt = parser.acceptsAll(Arrays.asList("cgi"), "Run as a cgi script");
		OptionSpec<?> help = parser.acceptsAll(Arrays.asList("h", "help", "?"), "Show this help");
		try {
			OptionSet options = parser.parse(args);
			if(!options.has(help)) {
				if(options.has(cgiOpt)) {
					CgiHttpExchange cgiExchange = new CgiHttpExchange();
					HttpHandler handler = null;
					String path = cgiExchange.getRequestURI().getPath();
					for(int i = path.length(); i > 0; i--) {
						handler = pathHandlers.get(path.substring(0, i));
						if(handler != null) {
							break;
						}
					}
					if(handler == null) {
						System.out.print("Content-type: text/plain\n\n");
						System.out.println("No handler found for: " + cgiExchange.getRequestURI().getPath());
						return;
					}
					handler.handle(cgiExchange);
					return;
				}
				int port = options.valueOf(portOpt);
				File scrambleFolder = options.valueOf(scrambleFolderOpt);
				boolean openBrowser = !options.has(noBrowserOpt);
				try {
					new TNoodleServer(port, scrambleFolder, openBrowser);
				} catch(BindException e) {
					// If this port is in use, we assume it's an instance of
					// TNoodleServer, and ask it to commit honorable suicide.
					// After that, we can start up. If it was a TNoodleServer,
					// it hopefully will have freed up the port we want.
					URL url = new URL("http://localhost:" + port + "/kill/now");
					System.out.println("Detected server running on port " + port + ", maybe it's an old " + NAME + "?");
					if(options.has(noUpgradeOpt)) {
						System.out.println("noupgrade option set. You'll have to free up port " + port + " manually, or clear this option.");
						return;
					}
					System.out.println("Sending request to " + url + " to hopefully kill it.");
					URLConnection conn = url.openConnection();
					InputStream in = conn.getInputStream();
					in.close();
					// If we've gotten here, then the previous server may be dead,
					// lets try to start up.
					System.out.println("Hopefully the old server is now dead, trying to start up.");
					final int MAX_TRIES = 10;
					for(int i = 1; i <= MAX_TRIES; i++) {
						try {
							Thread.sleep(1000);
							System.out.println("Attempt " + i + "/" + MAX_TRIES + " to start up");
							new TNoodleServer(port, scrambleFolder, openBrowser);
							break;
						} catch(Exception ee) {
							ee.printStackTrace();
						}
					}
				}
				return;
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		parser.printHelpOn(System.out);
		System.exit(1); // non zero exit status
	}
}
