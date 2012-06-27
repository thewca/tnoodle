package net.gnehzr.tnoodle.server;

import static net.gnehzr.tnoodle.utils.Utils.azzert;

import java.awt.Desktop;
import java.awt.Image;
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
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;
import java.util.logging.Level;

import javax.swing.ImageIcon;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLParameters;
import java.security.NoSuchAlgorithmException;
import java.security.KeyStore;
import java.security.cert.CertificateException;
import java.security.UnrecoverableKeyException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import javax.crypto.spec.SecretKeySpec;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.KeyManagerFactory;

import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;
import net.gnehzr.tnoodle.utils.Launcher;
import net.gnehzr.tnoodle.utils.TNoodleLogging;
import net.gnehzr.tnoodle.utils.Utils;
import tnoodleServerHandler.DirectoryHandler;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpsServer;
import com.sun.net.httpserver.HttpsConfigurator;
import com.sun.net.httpserver.HttpsParameters;

public class TNoodleServer {
	
	private static final int MIN_HEAP_SIZE_MEGS = 512;
	private static final int TCP_BACKLOG = 0;

	private static final String ICONS_FOLDER = "icons";
	private static final String ICON_WRAPPER = "tnoodle_logo_1024_gray.png";
	private static final String ICON_WORKER = "tnoodle_logo_1024.png";

	public static String NAME = Utils.getProjectName();
	public static String VERSION = Utils.getVersion();

	private static class HttpsConfig {
		int port;
		File keystoreFile;
		char[] keystorePassphrase;
	}
	
	//TODO - it would be nice to kill threads when the tcp connection is killed, not sure if this is possible, though
	public TNoodleServer(int httpPort, HttpsConfig httpsConfig, boolean bindAggressively, boolean browse) throws IOException, NoSuchAlgorithmException, KeyStoreException, UnrecoverableKeyException, KeyManagementException, CertificateException {
		int httpsPort = httpsConfig == null ? -1 : httpsConfig.port;
		azzert((httpPort > 0) || (httpsPort > 0), "Must start at least one server (http and/or https)");
		azzert(httpPort != httpsPort, "Can't run http and https server on same port");

		TNoodleServerPluginDelegator context = new TNoodleServerPluginDelegator();
		ExecutorService executor = Executors.newCachedThreadPool();

		if(httpsPort > 0) {
			String keystoreGenerationHelp = "You can generate a keystore by running the keytool command that comes with the JDK. For example:\n    keytool -genkey -dname \"CN=Jeremy Fleischman, OU=TNoodle, O=WCA, L=San Francisco, ST=California, C=US\" -keystore KEYSTORE_FILENAME";
			File keystoreFile = httpsConfig.keystoreFile;
			if(keystoreFile == null) {
				System.out.println("Must specify a keystore. " + keystoreGenerationHelp);
				return;
			}
			char[] passphrase = httpsConfig.keystorePassphrase;
			if(passphrase == null) {
				System.out.println("Must specify a keystore password. " + keystoreGenerationHelp);
				return;
			}
			KeyStore ks = KeyStore.getInstance("JKS");

			ks.load(new FileInputStream(httpsConfig.keystoreFile), passphrase);

			KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
			kmf.init(ks, passphrase);

			TrustManagerFactory tmf = TrustManagerFactory.getInstance("SunX509");
			tmf.init(ks);

			SSLContext ssl = SSLContext.getInstance("TLS");
			ssl.init(kmf.getKeyManagers(), tmf.getTrustManagers(), null);

			AggressiveHttpServerCreator<HttpsServer> creator = new AggressiveHttpServerCreator<HttpsServer>();
			HttpsServer httpsServer = creator.aggressivelyBindSocket(httpsConfig.port, bindAggressively);
			httpsServer.setHttpsConfigurator(new HttpsConfigurator(ssl));

			httpsServer.createContext("/", context);
			httpsServer.setExecutor(executor);
			httpsServer.start();
		}

		if(httpPort > 0) {
			AggressiveHttpServerCreator<HttpServer> creator = new AggressiveHttpServerCreator<HttpServer>();
			HttpServer httpServer = creator.aggressivelyBindSocket(httpPort, bindAggressively);


			httpServer.createContext("/", context);
			httpServer.setExecutor(executor);
			httpServer.start();
		}
		
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
				String url = null;
				String httpUrl = null;
				if(httpPort > 0) {
					httpUrl = "http://" + hostname + ":" + httpPort;
					url = httpUrl;
				}
				String httpsUrl = null;
				if(httpsPort > 0) {
					httpsUrl = "https://" + hostname + ":" + httpsPort;
					// We'd rather navigate our user to the https server if we have one
					url = httpsUrl;
				}
				azzert(url != null);

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

	// I don't know how to do the call to H.create in a typesafe manner. Oh well.
	@SuppressWarnings("unchecked")
	private static class AggressiveHttpServerCreator<H extends HttpServer> {
		private H aggressivelyBindSocket(int port, boolean bindAggressively) throws IOException {
			H server = null;

			final int MAX_TRIES = 10;
			for(int i = 0; i < MAX_TRIES && server == null; i++) {
				if(i > 0) {
					System.out.println("Attempt " + (i+1) + "/" + MAX_TRIES + " to bind to port " + port);
				}
				try {
					InetSocketAddress s = new InetSocketAddress(port);
					server = (H) H.create(s, TCP_BACKLOG);
				} catch(BindException e) {
					// If this port is in use, we assume it's an instance of
					// TNoodleServer, and ask it to commit honorable suicide.
					// After that, we can start up. If it was a TNoodleServer,
					// it hopefully will have freed up the port we want.
					System.out.println("Detected server running on port " + port + ", maybe it's an old " + NAME + "?");
					if(!bindAggressively) {
						System.out.println("noupgrade option set. You'll have to free up port " + port + " manually, or clear this option.");
						break;
					}
					try {
						URL url = new URL("http://localhost:" + port + "/kill/now");
						System.out.println("Sending request to " + url + " to hopefully kill it.");
						URLConnection conn = url.openConnection();
						InputStream in = conn.getInputStream();
						in.close();
						Thread.sleep(1000);
					} catch(MalformedURLException ee) {
						ee.printStackTrace();
					} catch(IOException ee) {
						ee.printStackTrace();
					} catch(InterruptedException ee) {
						ee.printStackTrace();
					}
				}
			}

			if(server == null) {
				System.out.println("Failed to bind to port " + port + ". Giving up");
				System.exit(1);
			}

			return server;
		}
	}
	
	// Preferred way to detect OSX according to https://developer.apple.com/library/mac/#technotes/tn2002/tn2110.html
	public static boolean isOSX() {
    String osName = System.getProperty("os.name");
    return osName.contains("OS X");
	}
	
	/*
	 * Sets the dock icon in OSX. Could be made to have uses in other operating systems.
	 */
	private static void setApplicationIcon() {
		// Let's wrap everything in a big try-catch, just in case OS-specific stuff goes wonky. 
		try {
			
			// Find out which icon to use.
			
			final Launcher.PROCESS_TYPE processType = Launcher.getProcessType();
			
			final String iconFileName;
			switch (processType) {
				case WORKER:
					iconFileName = ICON_WORKER;
					break;
				default:
					iconFileName = ICON_WRAPPER;
					break;	
			}
			
			// Get the file name of the icon.
			final String fullFileName = Utils.getResourceDirectory() + "/" + ICONS_FOLDER + "/" + iconFileName;
			final Image image = new ImageIcon(fullFileName).getImage();

			// OSX-specific code to set the dock icon.
			if (isOSX()) {
				final com.apple.eawt.Application application = com.apple.eawt.Application.getApplication();
				application.setDockIconImage(image);
			}
		}
		catch (Exception e) {
		}
	}

	public static void main(String[] args) throws IOException {
		Utils.doFirstRunStuff();
		TNoodleLogging.initializeLogging();

		setApplicationIcon();
		Launcher.wrapMain(args, MIN_HEAP_SIZE_MEGS);
		setApplicationIcon();
		
		OptionParser parser = new OptionParser();
		OptionSpec<Integer> httpPortOpt = parser.
			acceptsAll(Arrays.asList("p", "http"), "The port to run the http server on").
				withRequiredArg().
					ofType(Integer.class).
					defaultsTo(8080);
		OptionSpec<Integer> httpsPortOpt = parser.
			acceptsAll(Arrays.asList("https"), "The port to run the https server on").
				withRequiredArg().
					ofType(Integer.class).
					defaultsTo(-1);
		OptionSpec<File> keystoreOpt = parser.
			acceptsAll(Arrays.asList("keystore"), "A keystore file containing ssl certificates.").
				withRequiredArg().
					ofType(File.class);
		OptionSpec<String> keypasswdOpt = parser.
			acceptsAll(Arrays.asList("keypasswd"), "The password for the keystore.").
				withRequiredArg().
					ofType(String.class);
		OptionSpec<?> noBrowserOpt = parser.acceptsAll(Arrays.asList("n", "nobrowser"), "Don't open the browser when starting the server");
		OptionSpec<?> noUpgradeOpt = parser.acceptsAll(Arrays.asList("u", "noupgrade"), "If an instance of " + NAME + " is running on the desired port(s), do not attempt to kill it and start up");
		OptionSpec<File> injectJsOpt = parser.acceptsAll(Arrays.asList("i", "inject"), "File containing code to inject into the bottom of the <head>...</head> section of all html served").withRequiredArg().ofType(File.class);
		OptionSpec<?> noCachingOpt = parser.acceptsAll(Arrays.asList("d", "disable-caching"), "Disable file caching. This is useful for development, but is way slower.");
		OptionSpec<?> help = parser.acceptsAll(Arrays.asList("h", "help", "?"), "Show this help");
		String levels = Utils.join(TNoodleLogging.getLevels(), ",");
		OptionSpec<String> consoleLogLevel = parser.
			acceptsAll(Arrays.asList("cl", "consoleLevel"), "The minimum level a log must be to be printed to the console. Options: " + levels).
				withRequiredArg().
					ofType(String.class).
					defaultsTo(Level.WARNING.getName());
		OptionSpec<String> fileLogLevel = parser.
			acceptsAll(Arrays.asList("fl", "fileLevel"), "The minimum level a log must be to be printed to " + TNoodleLogging.getLogFile() + ". Options: " + levels).
				withRequiredArg().
					ofType(String.class).
					defaultsTo(Level.INFO.getName());
		try {
			OptionSet options = parser.parse(args);
			if(!options.has(help)) {
				boolean bindAggressively = !options.has(noUpgradeOpt);
				Level cl = Level.parse(options.valueOf(consoleLogLevel));
				TNoodleLogging.setConsoleLogLevel(cl);
				Level fl = Level.parse(options.valueOf(fileLogLevel));
				TNoodleLogging.setFileLogLevel(fl);

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
				int httpPort = options.valueOf(httpPortOpt);
				int httpsPort = options.valueOf(httpsPortOpt);
				HttpsConfig httpsConfig = new HttpsConfig();
				httpsConfig.port = httpsPort;
				httpsConfig.keystoreFile = options.valueOf(keystoreOpt);
				String keystorePassphrase = options.valueOf(keypasswdOpt);
				if(keystorePassphrase != null) {
					httpsConfig.keystorePassphrase = keystorePassphrase.toCharArray();
				}

				boolean openBrowser = !options.has(noBrowserOpt);
				new TNoodleServer(httpPort, httpsConfig, bindAggressively, openBrowser);
				return;
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		parser.printHelpOn(System.out);
		System.exit(1); // non zero exit status
	}
}
