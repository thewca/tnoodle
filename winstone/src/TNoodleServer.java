
import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;

import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;
import net.gnehzr.tnoodle.utils.TNoodleLogging;
import net.gnehzr.tnoodle.utils.Utils;
import winstone.Launcher;


public class TNoodleServer {
	public static String NAME = Utils.getProjectName();
	public static String VERSION = Utils.getVersion();
	
	public TNoodleServer(int httpPort, boolean bindAggressively, boolean openBrowser) throws IOException {
		 // at startup
		Map<String, String> serverArgs = new HashMap<String, String>();
		serverArgs.put("webappsDir", "testing");
		serverArgs.put("httpPort", "8080");
		serverArgs.put("ajp13Port", "-1");
		serverArgs.put("commonLibFolder", "C:\\cygwin\\home\\jeremy\\tnoodle\\lib");
		Launcher.initLogger(serverArgs);
		Launcher winstone = new Launcher(serverArgs); // spawns threads, so your application doesn't block

		// before shutdown
//		winstone.shutdown();
	}

	public static void main(String[] args) throws IOException {
		Utils.doFirstRunStuff();
		TNoodleLogging.initializeLogging();

		// TODO add suppport for this stuff w/ new Launcher idea
//		setApplicationIcon();
//		Launcher.wrapMain(args, MIN_HEAP_SIZE_MEGS);
//		setApplicationIcon();
		
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

				// TODO - feature catchup
//				if(options.has(injectJsOpt)) {
//					File injectCodeFile = options.valueOf(injectJsOpt);
//					if(!injectCodeFile.exists() || !injectCodeFile.canRead()) {
//						System.err.println("Cannot find or read " + injectCodeFile);
//						System.exit(1);
//					}
//					DataInputStream in = new DataInputStream(new FileInputStream(injectCodeFile));
//					byte[] b = new byte[(int) injectCodeFile.length()];
//					in.readFully(b);
//					in.close();
//					DirectoryHandler.setHeadInjectCode(new String(b));
//				}
				
				// TODO - is this still relevant?
				boolean enableCaching = !options.has(noCachingOpt);
				
				int httpPort = options.valueOf(httpPortOpt);
				
				// TODO - https support??
//				int httpsPort = options.valueOf(httpsPortOpt);
//				HttpsConfig httpsConfig = new HttpsConfig();
//				httpsConfig.port = httpsPort;
//				httpsConfig.keystoreFile = options.valueOf(keystoreOpt);
//				String keystorePassphrase = options.valueOf(keypasswdOpt);
//				if(keystorePassphrase != null) {
//					httpsConfig.keystorePassphrase = keystorePassphrase.toCharArray();
//				}

				boolean openBrowser = !options.has(noBrowserOpt);
				new TNoodleServer(httpPort, bindAggressively, openBrowser);
				return;
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		parser.printHelpOn(System.out);
		System.exit(1); // non zero exit status
	}
	
}
