package net.gnehzr.tnoodle.utils;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;

public class LazyClassLoader extends URLClassLoader {
	public LazyClassLoader(File folder) throws MalformedURLException {
		super(new URL[]{ folder.toURI().toURL() });
	}
}
