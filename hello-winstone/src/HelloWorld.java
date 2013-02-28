
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.Statement;

import javax.naming.InitialContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import net.gnehzr.tnoodle.server.SafeHttpServlet;

@SuppressWarnings("serial")
public class HelloWorld extends SafeHttpServlet {

    public HelloWorld() {}

    protected void wrappedService(HttpServletRequest request, HttpServletResponse response, String[] path, java.util.LinkedHashMap<String,String> query) throws Exception {
		PrintWriter out = response.getWriter();
	    out.println("Hello World");

	    InitialContext jndiContext = new InitialContext();
	    DataSource ds = (DataSource) jndiContext.lookup("java:comp/env/jdbc/connPool");
	    Connection conn = ds.getConnection("root", "password");
	    Statement stmt = conn.createStatement();
	    boolean results = stmt.execute("SELECT NOW();");
	    out.println("<br>results: " + results + "<br>");
	}

}
