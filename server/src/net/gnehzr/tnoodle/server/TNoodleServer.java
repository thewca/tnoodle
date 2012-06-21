package net.gnehzr.tnoodle.server;

import java.awt.Desktop;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.BindException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.InterfaceAddress;
import java.net.NetworkInterface;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.concurrent.Executors;
import java.util.logging.Level;

import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;
import net.gnehzr.tnoodle.utils.Launcher;
import net.gnehzr.tnoodle.utils.TNoodleLogging;
import net.gnehzr.tnoodle.utils.Utils;
import tnoodleServerHandler.DirectoryHandler;

import com.sun.net.httpserver.HttpServer;

public class TNoodleServer {
	private static final int MIN_HEAP_SIZE_MEGS = 512;

	public static String NAME = Utils.getProjectName();
	public static String VERSION = Utils.getVersion();
	
	//TODO - it would be nice to kill threads when the tcp connection is killed, not sure if this is possible, though
	public TNoodleServer(int port, boolean browse) throws IOException {
		HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

		server.createContext("/", new TNoodleServerPluginDelegator());

		server.setExecutor(Executors.newCachedThreadPool());
		server.start();
		
		System.out.println(NAME + "-" + VERSION + " started");
		
		ArrayList<String> hostnames = new ArrayList<String>();
		try {
			hostnames.add(InetAddress.getLocalHost().getHostAddress());
		} catch(UnknownHostException e) {
			for(Enumeration<NetworkInterface> intfs = NetworkInterface.getNetworkInterfaces(); intfs.hasMoreElements();) {
				NetworkInterface intf = intfs.nextElement();
				for(InterfaceAddress addr : intf.getInterfaceAddresses()) {
					hostnames.add(addr.getAddress().getHostAddress());
				}
			}
		}

		if(hostnames.isEmpty()) {
			System.out.println("Couldn't find any hostnames for this machine");
		} else {
			if(hostnames.size() > 1 && browse) {
				browse = false;
				System.out.println("Couldn't determine which url to browse to");
			}
			for(String hostname : hostnames) {
				String addr = hostname + ":" + port;
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
		}
	}

	public static void main(String[] args) throws IOException {
		Utils.doFirstRunStuff();
		TNoodleLogging.initializeLogging(Level.INFO);
		Launcher.wrapMain(args, MIN_HEAP_SIZE_MEGS);

		OptionParser parser = new OptionParser();
		OptionSpec<Integer> portOpt = parser.
			acceptsAll(Arrays.asList("p", "port"), "The port to run the http server on").
				withOptionalArg().
					ofType(Integer.class).
					defaultsTo(8080);
		OptionSpec<?> noBrowserOpt = parser.acceptsAll(Arrays.asList("n", "nobrowser"), "Don't open the browser when starting the server");
		OptionSpec<?> noUpgradeOpt = parser.acceptsAll(Arrays.asList("u", "noupgrade"), "If an instance of " + NAME + " is running on the desired port, do not attempt to kill it and start up");
		OptionSpec<File> injectJsOpt = parser.acceptsAll(Arrays.asList("i", "inject"), "File containing code to inject into the bottom of the <head>...</head> section of all html served").withOptionalArg().ofType(File.class);
		OptionSpec<?> noCachingOpt = parser.acceptsAll(Arrays.asList("d", "disable-caching"), "Disable file caching. This is useful for development, but is way slower.");
		OptionSpec<?> help = parser.acceptsAll(Arrays.asList("h", "help", "?"), "Show this help");
		try {
			OptionSet options = parser.parse(args);
			if(!options.has(help)) {
				if(options.has(injectJsOpt)) {
					File injectCodeFile = options.valueOf(injectJsOpt);
					if(!injectCodeFile.exists() || !injectCodeFile.canRead()) {
						System.err.println("Cannot find or read " + injectCodeFile);
						System.exit(1);
					}
					DataInputStream in = new DataInputStream(new FileInputStream(injectCodeFile));
					byte[] b = new byte[(int) injectCodeFile.length()];
					in.readFully(b);
					DirectoryHandler.setHeadInjectCode(new String(b));
				}
				boolean enableCaching = !options.has(noCachingOpt);
				DirectoryHandler.setCachingEnabled(enableCaching);
				int port = options.valueOf(portOpt);
				boolean openBrowser = !options.has(noBrowserOpt);
				try {
					new TNoodleServer(port, openBrowser);
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
							new TNoodleServer(port, openBrowser);
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
