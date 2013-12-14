package net.gnehzr.tnoodle.utils;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.toColor;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.toHex;

import java.awt.Color;
import java.awt.geom.GeneralPath;
import java.awt.geom.PathIterator;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintStream;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Type;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.nio.channels.FileChannel;
import java.text.SimpleDateFormat;
import java.util.LinkedHashMap;
import java.util.jar.JarEntry;
import java.util.jar.JarInputStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.Random;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

public final class Utils {
    private static final Logger l = Logger.getLogger(Utils.class.getName());

    private static final String RESOURCE_FOLDER = "tnoodle_resources";
    private static final String DEVEL_VERSION = "devel";
    public static final SimpleDateFormat SDF = new SimpleDateFormat("yyyy/MM/dd");

    private Utils() {}

    public static String throwableToString(Throwable e) {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        e.printStackTrace(new PrintStream(bytes));
        return bytes.toString();
    }

    public static void fullyReadInputStream(InputStream is, ByteArrayOutputStream bytes) throws IOException {
        final byte[] buffer = new byte[0x10000];
        try {
            for(;;) {
                int read = is.read(buffer);
                if(read < 0) {
                    break;
                }
                bytes.write(buffer, 0, read);
            }
        } finally {
            is.close();
        }
    }

    public static void copyFile(File sourceFile, File destFile) throws IOException {
        if(!destFile.exists()) {
            destFile.createNewFile();
        }

        FileChannel source = null;
        FileChannel destination = null;
        try {
            source = new FileInputStream(sourceFile).getChannel();
            destination = new FileOutputStream(destFile).getChannel();
            destination.transferFrom(source, 0, source.size());
        } finally {
            if(source != null) {
                source.close();
            }
            if(destination != null) {
                destination.close();
            }
        }
    }


    // GSON encodes the string "'" as "\u0027" by default.
    // This behavior is controlled by the htmlSafe attribute.
    // We call disableHtmlEscaping to disable this behavior.
    private static GsonBuilder gsonBuilder = new GsonBuilder().disableHtmlEscaping();
    public static Gson GSON;
    public static synchronized void registerTypeAdapter(Class<?> clz, Object typeAdapter) {
        gsonBuilder = gsonBuilder.registerTypeAdapter(clz, typeAdapter);
        GSON = gsonBuilder.create();
    }
    public static synchronized void registerTypeHierarchyAdapter(Class<?> clz, Object typeAdapter) {
        gsonBuilder = gsonBuilder.registerTypeHierarchyAdapter(clz, typeAdapter);
        GSON = gsonBuilder.create();
    }
    static {
        registerTypeAdapter(Color.class, new Colorizer());
        registerTypeAdapter(GeneralPath.class, new Pather());
    }

    private static class Colorizer implements JsonSerializer<Color>, JsonDeserializer<Color> {

        @Override
        public JsonElement serialize(Color c, Type t, JsonSerializationContext context) {
            return new JsonPrimitive(toHex(c));
        }

        @Override
        public Color deserialize(JsonElement json, Type t, JsonDeserializationContext context) throws JsonParseException {
            Color c = toColor(json.getAsString());
            if(c == null) {
                throw new JsonParseException("Invalid color");
            }
            return c;
        }

    }

    private static class Pather implements JsonSerializer<GeneralPath>, JsonDeserializer<GeneralPath> {

        /*
         * NOTE: this is ported from Utils.toPoints()
         */
        @Override
        public JsonElement serialize(GeneralPath s, Type t, JsonSerializationContext context) {
            JsonArray areas = new JsonArray();
            JsonArray area = null;
            double[] coords = new double[2];
            PathIterator pi = s.getPathIterator(null, 1.0);
            while(!pi.isDone()) {
                int val = pi.currentSegment(coords);
                switch(val) {
                    case PathIterator.SEG_MOVETO:
                        area = new JsonArray();
                        areas.add(area);
                    case PathIterator.SEG_LINETO:
                    case PathIterator.SEG_CLOSE:
                        JsonArray pt = new JsonArray();
                        pt.add(new JsonPrimitive(coords[0]));
                        pt.add(new JsonPrimitive(coords[1]));
                        area.add(pt);
                        break;
                    default:
                        return null;
                }
                pi.next();
            }
            return areas;
        }

        @Override
        public GeneralPath deserialize(JsonElement json, Type t, JsonDeserializationContext context) throws JsonParseException {
            GeneralPath path = new GeneralPath();

            JsonArray areas = json.getAsJsonArray();
            for(int c = 0; c < areas.size(); c++) {
                JsonArray area = areas.get(c).getAsJsonArray();
                if(area.size() == 0) {
                    continue;
                }

                JsonArray pt = area.get(0).getAsJsonArray();
                path.moveTo(pt.get(0).getAsDouble(), pt.get(1).getAsDouble());
                for(int i = 1; i < area.size(); i++) {
                    pt = area.get(1).getAsJsonArray();
                    path.lineTo(pt.get(0).getAsDouble(), pt.get(1).getAsDouble());
                }
            }
            path.closePath();
            return path;
        }
    }

    public static File getResourceDirectory() {
        return getResourceDirectory(true);
    }

    private static File getResourceDirectory(boolean assertExists) {
        File f = getProgramDirectory();
        if(getCallerClass().getClassLoader() instanceof LazyClassLoader) {
            // Plugins are loaded from the resource folder, so we've already got the right folder.
            azzert(f.getName().equals(RESOURCE_FOLDER));
        } else {
            f = new File(f, RESOURCE_FOLDER);
            String version = getVersion();
            if(!version.equals(DEVEL_VERSION)) {
                // Each version of tnoodle extracts its resources
                // to its own subdirectory of RESOURCE_FOLDER
                f = new File(f, version);
            }
        }
        if(assertExists) {
            if(!f.isDirectory()) {
                l.log(Level.SEVERE, f.getAbsolutePath() + " does not exist, or is not a directory!");
                azzert(f.isDirectory());
            }
        }
        return f;
    }
    /**
     * @return A File representing the directory in which this program resides.
     * If this is a jar file, this should be obvious, otherwise it's the directory in which
     * our calling class resides.
     */
    public static File getProgramDirectory() {
        File programDirectory = getJarFileOrDirectory();
        if(programDirectory.isFile()) { //this should indicate a jar file
            programDirectory = programDirectory.getParentFile();
        }
        return programDirectory;
    }

    private static Class<?> getCallerClass() {
        Class<?> callerClass = null;
        StackTraceElement[] stElements = Thread.currentThread().getStackTrace();
        for (int i = 2; i < stElements.length; i++) {
            StackTraceElement ste = stElements[i];
            try {
                callerClass = Class.forName(ste.getClassName());
            } catch(ClassNotFoundException e) {
                azzert(false, e);
            }
            if(!Utils.class.getPackage().equals(callerClass.getPackage())) {
                return callerClass;
            }
        }
        return null;
    }

    private static File getJarFileOrDirectory() {
        Class<?> callerClass = getCallerClass();

        Class<?> referenceClass;
        if(callerClass.getClassLoader() == Utils.class.getClassLoader()) {
            referenceClass = callerClass;
        } else {
            // If our caller class's classloader was not Utils's classloader, then we
            // use Utils as a reference. This is to deal with classes that are part of a
            // web app, and were loaded with the servlet container's classloader.
            referenceClass = Utils.class;
        }

        File programDirectory;
        try {
            programDirectory = new File(referenceClass.getProtectionDomain().getCodeSource().getLocation().toURI().getPath());
        } catch (URISyntaxException e) {
            return new File(".");
        }
        return programDirectory;
    }

    public static File getJarFile() {
        File potentialJarFile = getJarFileOrDirectory();
        if(potentialJarFile.isFile()) {
            return potentialJarFile;
        }
        return null;
    }

    /**
     * Copied from http://code.google.com/p/guava-libraries/source/browse/guava/src/com/google/common/io/Files.java from http://stackoverflow.com/questions/617414/create-a-temporary-directory-in-java
     * Atomically creates a new directory somewhere beneath the system's
     * temporary directory (as defined by the {@code java.io.tmpdir} system
     * property), and returns its name.
     *
     * <p>Use this method instead of {@link File#createTempFile(String, String)}
     * when you wish to create a directory, not a regular file.  A common pitfall
     * is to call {@code createTempFile}, delete the file and create a
     * directory in its place, but this leads a race condition which can be
     * exploited to create security vulnerabilities, especially when executable
     * files are to be written into the directory.
     *
     * <p>This method assumes that the temporary volume is writable, has free
     * inodes and free blocks, and that it will not be called thousands of times
     * per second.
     *
     * @return the newly-created directory
     * @throws IllegalStateException if the directory could not be created
     */
    /** Maximum loop count when creating temp directories. */
    private static final int TEMP_DIR_ATTEMPTS = 10000;

    public static File createTempDir() {
        // Calling renameTo() on something in java.io.tmpdir to something in
        // tnoodle_resources doesn't seem to work. We opt to just put temp folders
        // in the same directory as the jar file.
        //File baseDir = new File(System.getProperty("java.io.tmpdir"));
        File baseDir = getProgramDirectory();
        String baseName = System.currentTimeMillis() + "-";

        for (int counter = 0; counter < TEMP_DIR_ATTEMPTS; counter++) {
            File tempDir = new File(baseDir, baseName + counter);
            if (tempDir.mkdir()) {
                return tempDir;
            }
        }
        throw new IllegalStateException("Failed to create directory within "
                + TEMP_DIR_ATTEMPTS + " attempts (tried "
                + baseName + "0 to " + baseName + (TEMP_DIR_ATTEMPTS - 1) + ')');
    }

    public static void doFirstRunStuff() throws FileNotFoundException, IOException {
        File jarFile = getJarFile();

        if(jarFile != null) {
            File resourceDirectory = getResourceDirectory(false);
            if(resourceDirectory.isDirectory()) {
                // If the resource folder already exists, we don't bother re-extracting the
                // files.
                return;
            }


            File tempResourceDirectory = createTempDir();
            JarInputStream jarIs = new JarInputStream(new FileInputStream(jarFile));
            JarEntry entry;
            byte[] buf = new byte[1024];
            while((entry = jarIs.getNextJarEntry()) != null) {
                if(entry.isDirectory()) {
                    continue;
                }

                if(entry.getName().startsWith(RESOURCE_FOLDER)) {
                    // Remove the leading RESOURCE_FOLDER from the filename,
                    // so we can put it in resourceDirectory directly.
                    String destName = entry.getName().substring(RESOURCE_FOLDER.length());
                    File destFile = new File(tempResourceDirectory, destName);
                    destFile.getParentFile().mkdirs();
                    FileOutputStream out = new FileOutputStream(destFile);

                    int n;
                    while ((n = jarIs.read(buf, 0, buf.length)) > -1) {
                        out.write(buf, 0, n);
                    }
                    out.close();
                }
                jarIs.closeEntry();
            }
            jarIs.close();
            resourceDirectory.getParentFile().mkdirs();
            azzert(tempResourceDirectory.renameTo(resourceDirectory));
        }
    }

    public static String getProjectName() {
        Package p = Utils.class.getPackage();
        String name = p.getImplementationTitle();
        if(name == null) {
            name = getCallerClass().getName();
        }
        return name;
    }

    public static String getVersion() {
        Package p = Utils.class.getPackage();
        String version = p.getImplementationVersion();
        if(version == null) {
            version = DEVEL_VERSION;
        }
        return version;
    }


    public static LinkedHashMap<String, String> parseQuery(String query) {
        LinkedHashMap<String, String> queryMap = new LinkedHashMap<String, String>();
        if(query == null) {
            return queryMap;
        }
        String[] pairs = query.split("&");
        for(String pair : pairs) {
            String[] key_value = pair.split("=");
            if(key_value.length == 1) {
                queryMap.put(key_value[0], ""); // this allows for flags such as http://foo/blah?kill&burn
            } else {
                try {
                    queryMap.put(key_value[0], URLDecoder.decode(key_value[1], "utf-8"));
                } catch (UnsupportedEncodingException e) {
                    queryMap.put(key_value[0], key_value[1]); //worst case, just put the undecoded string
                }
            }
        }
        return queryMap;
    }

    public static File getWebappsDir() {
        return new File(getResourceDirectory(), "/webapps/");
    }

    public static File getWebappDir(String webappName) {
        if(webappName == null) {
            webappName = "ROOT";
        }
        return new File(getWebappsDir(), webappName);
    }

    private static Random r;
    public static Random getSeededRandom() {
        if(r != null) {
            return r;
        }

        String randSeedEnvVar = "TNOODLE_RANDSEED";
        String seed = System.getenv(randSeedEnvVar);
        if(seed == null) {
            seed = "" + System.currentTimeMillis();
        }
        System.out.println("Using TNOODLE_RANDSEED " + seed);
        r = new Random(seed.hashCode());
        return r;
    }
}
