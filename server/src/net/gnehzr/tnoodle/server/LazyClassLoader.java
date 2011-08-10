package net.gnehzr.tnoodle.server;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class LazyClassLoader<H> {
	// serverPlugins.FileHandler("www/")
	private static final Pattern INSTANTIATION_PATTERN = Pattern.compile("(\\S+)\\s*\\((.*)\\)");
	// TODO - this pattern doesn't actually match all strings, and it doesn't match anything *but* strings
	private static final Pattern ARGUMENT_PATTERN = Pattern.compile("((\"[^,]*\")|(true)|(false)),?\\s*");

	private String className;
	private String definition;
	private Class<H> parentClass;
	public LazyClassLoader(String definition, Class<H> classy) throws BadClassDescriptionException {
		Matcher m = INSTANTIATION_PATTERN.matcher(definition);
		if(!m.matches()) {
			throw new BadClassDescriptionException(definition);
		}
		
		this.definition = definition;
		this.parentClass = classy;
		
		ArrayList<Class<?>> argTypes = new ArrayList<Class<?>>();
		ArrayList<Object> args = new ArrayList<Object>();
		// group 0 is the whole string
		// group 1 is the name of the class we're lazily instantiating
		// group 2 is the constructor arguments
		this.className = m.group(1);
		String arguments = m.group(2);
		m = ARGUMENT_PATTERN.matcher(arguments);
		int start = 0;
		while(m.find(start)) {
			start = m.end();
			String strExpr = m.group(2);
			String trueExpr = m.group(3);
			String falseExpr = m.group(4);
			if(strExpr != null) {
				argTypes.add(String.class);
				assert strExpr.startsWith("\"") && strExpr.endsWith("\"");
				// TODO - handle escape character (decode string!)
				String str = strExpr.substring(1, strExpr.length()-1);
				args.add(str);
			} else if(trueExpr != null) {
				argTypes.add(boolean.class);
				args.add(true);
			} else if(falseExpr != null) {
				argTypes.add(boolean.class);
				args.add(false);
			} else {
				assert false;
			}
		}
		assert start == arguments.length();
		this.argTypes = argTypes.toArray(new Class<?>[0]);
		this.args = args.toArray();
	}
	
	private Constructor<? extends H> constructor;
	private Class<?>[] argTypes;
	private Object[] args;
	private Class<? extends H> thisClass;
	public H newInstance() throws IllegalArgumentException, InstantiationException, IllegalAccessException, InvocationTargetException, ClassNotFoundException, SecurityException, NoSuchMethodException {
		if(constructor == null) {
			thisClass = Class.forName(className).asSubclass(this.parentClass);
			constructor = thisClass.getConstructor(this.argTypes);
		}
		return constructor.newInstance(args);
	}
	
	private H cachedInstance = null;
	public H cachedInstance() throws IllegalArgumentException, InstantiationException, IllegalAccessException, InvocationTargetException, SecurityException, ClassNotFoundException, NoSuchMethodException {
		if(cachedInstance == null) {
			cachedInstance = newInstance();
		}
		return cachedInstance;
	}
	
	@Override
	public String toString() {
		return super.toString() + " " + this.definition;
	}
}

@SuppressWarnings("serial")
class BadClassDescriptionException extends Exception {
	public BadClassDescriptionException(String description) {
		super(description);
	}
}
