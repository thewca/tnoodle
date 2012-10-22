package net.gnehzr.tnoodle.cubecomps;

import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.sql.DataSource;

import net.gnehzr.tnoodle.utils.Utils;

@SuppressWarnings("serial")
public class InitializeCubecompsDbServlet extends HttpServlet {
	private static final Logger l = Logger.getLogger(InitializeCubecompsDbServlet.class.getName());

	@Override
	public void init() throws ServletException {
		super.init();
		try {
			safeInit();
		} catch(Throwable t) {
			l.log(Level.SEVERE, "", t);
		}
	}
	
	private void safeInit() throws IOException, SQLException, ClassNotFoundException, InstantiationException, IllegalAccessException, NamingException {
		StringBuilder schema;
		String dataStructurePath = getServletContext().getRealPath("cubecomps/DATA-STRUCTURE.md");
		FileInputStream dataStructureInputStream = new FileInputStream(dataStructurePath);
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		Utils.fullyReadInputStream(dataStructureInputStream, baos);
		schema = new StringBuilder(baos.toString());
		
		final String SCHEMA_START = "<pre><code>"; 
		final String SCHEMA_END = "</code></pre>";
		
		int schemaStartIndex = schema.indexOf(SCHEMA_START) + SCHEMA_START.length();
		int schemaEndIndex = schema.indexOf(SCHEMA_END, schemaStartIndex);
		schema.replace(schemaEndIndex, schema.length(), "");
		schema.replace(0, schemaStartIndex, "");
		
		// Remove trailing CREATE TABLE options that h2 doesn't support, like:
		//  ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 AUTO_INCREMENT=6
		Pattern p = Pattern.compile("\\).*ENGINE=.*");
		Matcher m = p.matcher(schema);
		StringBuffer sanitizedSchema = new StringBuffer();
		while(m.find()) {
			m.appendReplacement(sanitizedSchema, ");");
		}
		m.appendTail(sanitizedSchema);

		Connection conn = null;
		try {
			InitialContext jdniContext = new InitialContext();
			DataSource ds = (DataSource) jdniContext.lookup("java:comp/env/jdbc/connPool");
			
			conn = ds.getConnection();
			conn.setAutoCommit(false);
			Statement stmt = conn.createStatement();
			stmt.execute(sanitizedSchema.toString());
			conn.commit();
		} catch (SQLException e) {
			l.log(Level.SEVERE, "", e);
		} catch (NamingException e) {
			l.log(Level.SEVERE, "", e);
		} finally {
			if(conn != null) {
				conn.close();
			}
		}
	}
	
}
