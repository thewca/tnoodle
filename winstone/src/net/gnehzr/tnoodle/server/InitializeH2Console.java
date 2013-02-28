package net.gnehzr.tnoodle.server;

import java.lang.reflect.*;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

@SuppressWarnings("serial")
public class InitializeH2Console extends HttpServlet {
	private static final Logger l = Logger.getLogger(InitializeH2Console.class.getName());

	@Override
	public void init() throws ServletException {
		super.init();
		try {
			safeInit();
		} catch(Throwable t) {
			l.log(Level.SEVERE, "", t);
		}
	}

	private void safeInit() throws SecurityException, NoSuchFieldException, ClassNotFoundException, IllegalArgumentException, IllegalAccessException {
		// All this mess is to mutate the
		//  private static final String[] GENERIC = { ...
		// field in org.h2.server.web.WebServer
		// Shamelessly copied from http://stackoverflow.com/questions/3301635/change-private-static-final-field-using-java-reflection?answertab=votes#tab-top

		Class<?> webServer = Class.forName("org.h2.server.web.WebServer");

		Field genericField = webServer.getDeclaredField("GENERIC");
		Field modifiersField = Field.class.getDeclaredField("modifiers");
		modifiersField.setAccessible(true);
		modifiersField.setInt(genericField, genericField.getModifiers() & ~Modifier.FINAL);

		genericField.setAccessible(true);
		genericField.set(null, new String[] { "TNoodle H2 Database|javax.naming.InitialContext|java:comp/env/jdbc/connPool|root" });
	}

}
