package net.gnehzr.tnoodle.server;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import tray.SystemTrayProvider;
import tray.SystemTrayAdapter;
import tray.TrayIconAdapter;
import tray.java.JavaIconAdapter;

import java.awt.Desktop;
import java.awt.Image;
import java.awt.event.ActionListener;
import java.awt.event.ActionEvent;
import java.awt.PopupMenu;
import java.awt.MenuItem;
import java.awt.SystemTray;
import java.awt.TrayIcon;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.BindException;
import java.net.InetAddress;
import java.net.InterfaceAddress;
import java.net.MalformedURLException;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.naming.NamingException;
import javax.swing.ImageIcon;

import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;
import joptsimple.util.KeyValuePair;
import net.gnehzr.tnoodle.utils.Launcher;
import net.gnehzr.tnoodle.utils.TNoodleLogging;
import net.gnehzr.tnoodle.utils.Utils;
import net.gnehzr.tnoodle.utils.GwtSafeUtils;
import winstone.TNoodleWinstoneLauncher;


public class TNoodleServer {
    private static final Logger l = Logger.getLogger(TNoodleServer.class.getName());

    public static String NAME = Utils.getProjectName();
    public static String VERSION = Utils.getVersion();

    private static final int MIN_HEAP_SIZE_MEGS = 512;

    private static final String ICONS_FOLDER = "icons";
    private static final String ICON_WRAPPER = "tnoodle_logo_1024_gray.png";
    private static final String ICON_WORKER = "tnoodle_logo_1024.png";

    private static final String DB_NAME = "tnoodledb";
    private static final String DB_USERNAME = "root";
    private static final String DB_PASSWORD = "password";

    private int httpPort;
    public TNoodleServer(int httpPort, boolean bindAggressively, boolean browse) throws IOException, ClassNotFoundException, NamingException {
        this.httpPort = httpPort;
         // at startup
        Map<String, String> serverArgs = new HashMap<String, String>();
        serverArgs.put("webappsDir", Utils.getWebappsDir().getAbsolutePath());
        serverArgs.put("httpPort", "" + httpPort);
        serverArgs.put("ajp13Port", "-1");

        String dbDriver = "org.h2.Driver";
        boolean initializeDb;
        try {
            Class.forName(dbDriver);
            initializeDb = true;
        } catch(ClassNotFoundException e) {
            initializeDb = false;
            l.info("Could not find class " + dbDriver + ", so we're not creating an entry in JNDI for a db.");
        }
        if(initializeDb) {
            File db = new File(Utils.getResourceDirectory(), DB_NAME);
            serverArgs.put("useJNDI", "true");
            serverArgs.put("jndi.resource.jdbc/connPool", "javax.sql.DataSource");
            serverArgs.put("jndi.param.jdbc/connPool.url", String.format("jdbc:h2:%s;MODE=MySQL;USER=%s;PASSWORD=%s;MVCC=TRUE", db.getAbsoluteFile(), DB_USERNAME, DB_PASSWORD));
            serverArgs.put("jndi.param.jdbc/connPool.driverClassName", dbDriver);
            serverArgs.put("jndi.param.jdbc/connPool.username", DB_USERNAME);
            serverArgs.put("jndi.param.jdbc/connPool.password", DB_PASSWORD);
        }

        // By default, winstone looks in ./lib, which I don't like, as it means
        // we'll behave differently when run from different directories.
        serverArgs.put("commonLibFolder", "");

        ServerSocket ss = aggressivelyBindSocket(httpPort, bindAggressively);
        azzert(ss != null);

        final Logger winstoneLogger = Logger.getLogger(winstone.Logger.class.getName());
        winstone.Logger.init(winstone.Logger.MAX, new OutputStream() {
            private StringBuilder msg = new StringBuilder();

            @Override
            public void write(int b) throws IOException {
                char ch = (char) b;
                if(ch == '\n') {
                    winstoneLogger.log(Level.FINER, msg.toString());
                    msg.setLength(0);
                } else {
                    msg.append(ch);
                }
            }
        }, false);

        TNoodleWinstoneLauncher.create(serverArgs, ss);

        System.out.println(NAME + "-" + VERSION + " started");

        ArrayList<String> urls = openTabInBrowser(browse);
        for(String url : urls) {
            System.out.println("Visit " + url + " for a readme and demo.");
        }
    }

    public ArrayList<String> openTabInBrowser(boolean browse) throws IOException {
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
        ArrayList<String> urls = new ArrayList<String>();
        for(String hostname : hostnames) {
            String url = "http://" + hostname + ":" + this.httpPort;
            urls.add(url);
        }

        if(hostnames.isEmpty()) {
            l.warning("Couldn't find any hostnames for this machine.");
        } else if(hostnames.size() > 1) {
            if(browse) {
                browse = false;
                l.warning("Could not decide which of these urls to browse to: " + hostnames);
            }
        } else {
            if(browse) {
                if(Desktop.isDesktopSupported()) {
                    Desktop d = Desktop.getDesktop();
                    if(d.isSupported(Desktop.Action.BROWSE)) {
                        String url = urls.get(0);
                        try {
                            URI uri = new URI(url);
                            l.info("Attempting to open " + uri + " in browser.");
                            d.browse(uri);
                        } catch(URISyntaxException e) {
                            l.log(Level.WARNING, "Could not convert " + url + " to URI", e);
                        }
                    } else {
                        l.warning("Sorry, it appears the Desktop api is supported on your platform, but the BROWSE action is not.");
                    }
                } else {
                    l.warning("Sorry, it appears the Desktop api is not supported on your platform.");
                }
            }
        }
        return urls;
    }

    private ServerSocket aggressivelyBindSocket(int port, boolean bindAggressively) throws IOException {
        ServerSocket server = null;

        final int MAX_TRIES = 10;
        for(int i = 0; i < MAX_TRIES && server == null; i++) {
            if(i > 0) {
                System.out.println("Attempt " + (i+1) + "/" + MAX_TRIES + " to bind to port " + port);
            }
            try {
                server = new ServerSocket(port, AggressiveHttpListener.getBacklogCount());
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


    // Preferred way to detect OSX according to https://developer.apple.com/library/mac/#technotes/tn2002/tn2110.html
    public static boolean isOSX() {
        String osName = System.getProperty("os.name");
        return osName.contains("OS X");
    }

    /*
     * Sets the dock icon in OSX. Could be made to have uses in other operating systems.
     */
    private static void setApplicationIcon() {
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
        if(isOSX()) {
            try {
                final com.apple.eawt.Application application = com.apple.eawt.Application.getApplication();
                application.setDockIconImage(image);
            } catch(Exception e) {
                l.log(Level.WARNING, "Error setting OSX dock icon", e);
            }
        } else {
            if(iconFileName != ICON_WORKER) {
                // Only want to create one tray icon.
                return;
            }

            if(!SystemTray.isSupported()) {
                l.warning("SystemTray is not supported");
                return;
            }

            URL imageUrl;
            try {
                imageUrl = new File(fullFileName).toURI().toURL();
            } catch(MalformedURLException e) {
                l.log(Level.WARNING, "Could not convert " + fullFileName + " to a URL", e);
                return;
            }
            SystemTrayAdapter trayAdapter = new SystemTrayProvider().getSystemTray();
            final PopupMenu popup = new PopupMenu();
            MenuItem openItem = new MenuItem("Open");
            popup.add(openItem);
            MenuItem exitItem = new MenuItem("Exit");
            popup.add(exitItem);

            openItem.addActionListener(new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    if(tnoodleServer != null) {
                        try {
                            tnoodleServer.openTabInBrowser(true);
                        } catch(IOException error) {
                            l.log(Level.WARNING, "Error opening tab in browser", error);
                        }
                    }
                }
            });
            exitItem.addActionListener(new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    l.info("Exit initiated from tray icon");
                    System.exit(0);
                }
            });

            TrayIconAdapter trayIconAdapter = trayAdapter.createAndAddTrayIcon(
                imageUrl,
                NAME + " v" + VERSION,
                popup);
            if(trayIconAdapter instanceof JavaIconAdapter) {
                // Unfortunately, java internally uses some shitty resizing
                // algorithm for this, so we have to do this ourselves.
                //trayIconAdapter.setImageAutoSize(true);

                SystemTray st = SystemTray.getSystemTray();
                JavaIconAdapter jia = (JavaIconAdapter) trayIconAdapter;
                TrayIcon ti = jia.getTrayIcon();
                ti.setImage(image.getScaledInstance(st.getTrayIconSize().width, -1, Image.SCALE_SMOOTH));
                
            }
        }
    }

    private static TNoodleServer tnoodleServer = null;
    public static void main(String[] args) throws IOException {
        Utils.doFirstRunStuff();
        TNoodleLogging.initializeLogging();

        OptionParser parser = new OptionParser();
        OptionSpec<Integer> httpPortOpt = parser.acceptsAll(Arrays.asList("p", "http"),
                "The port to run the http server on")
            .withRequiredArg().ofType(Integer.class).defaultsTo(8080);
        OptionSpec<?> noBrowserOpt = parser.acceptsAll(Arrays.asList("n", "nobrowser"),
                "Don't open the browser when starting the server");
        OptionSpec<?> noUpgradeOpt = parser.acceptsAll(Arrays.asList("u", "noupgrade"),
                "If an instance of " + NAME + " is running on the desired port(s), " +
                        "do not attempt to kill it and start up");
        OptionSpec<?> noReexecOpt = parser.acceptsAll(Arrays.asList(Launcher.NO_REEXEC_OPT),
                "Do not reexec. This is sometimes done to rename java.exe on Windows, or to get a larger heap size.");
        OptionSpec<File> injectJsOpt = parser.acceptsAll(Arrays.asList("i", "inject"),
                "File containing code to inject into the bottom of the " +
                "<head>...</head> section of all html served")
            .withRequiredArg().ofType(File.class);
        OptionSpec<KeyValuePair> jsEnvOpt = parser.accepts("jsenv",
                "Add entry to global js object TNOODLE_ENV in /env.js. " +
                "Treated as strings, so FOO=42 will create the entry TNOODLE_ENV['FOO'] = '42';")
            .withOptionalArg().ofType(KeyValuePair.class);
        OptionSpec<?> help = parser.acceptsAll(Arrays.asList("h", "help", "?"), "Show this help");
        String levels = GwtSafeUtils.join(TNoodleLogging.getLevels(), ",");
        OptionSpec<String> consoleLogLevel = parser.
            acceptsAll(Arrays.asList("cl", "consoleLevel"),
                    "The minimum level a log must be to be " +
                    "printed to the console. Options: " + levels).
                withRequiredArg().
                    ofType(String.class).
                    defaultsTo(Level.WARNING.getName());
        OptionSpec<String> fileLogLevel = parser.
            acceptsAll(Arrays.asList("fl", "fileLevel"),
                    "The minimum level a log must be to be printed to " +
                    TNoodleLogging.getLogFile() + ". Options: " + levels).
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

                // Note that we set the log level *before* we do any of this.
                // These two calls to setApplicationIcon() are intentional.
                // We want different icons for the parent process and the child
                // process.
                setApplicationIcon();
                Launcher.wrapMain(args, MIN_HEAP_SIZE_MEGS);
                setApplicationIcon();

                if(options.has(injectJsOpt)) {
                    File injectCodeFile = options.valueOf(injectJsOpt);
                    if(!injectCodeFile.exists() || !injectCodeFile.canRead()) {
                        System.err.println("Cannot find or read " + injectCodeFile);
                        System.exit(1);
                    }
                    HtmlInjectFilter.setHeadInjectFile(injectCodeFile);
                }
                if(options.has(jsEnvOpt)) {
                    List<KeyValuePair> jsEnv = options.valuesOf(jsEnvOpt);
                    for(KeyValuePair key_value : jsEnv) {
                        JsEnvServlet.putJsEnv(key_value.key, key_value.value);
                    }
                }
                int httpPort = options.valueOf(httpPortOpt);

                boolean openBrowser = !options.has(noBrowserOpt);
                tnoodleServer = new TNoodleServer(httpPort, bindAggressively, openBrowser);
                return;
            }
        } catch(Exception e) {
            e.printStackTrace();
        }
        parser.printHelpOn(System.out);
        System.exit(1); // non zero exit status
    }

}
