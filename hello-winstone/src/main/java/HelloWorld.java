import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import javax.naming.InitialContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import net.gnehzr.tnoodle.server.SafeHttpServlet;

@SuppressWarnings("serial")
@WebServlet(name = "Hello", urlPatterns = {"/HelloWorld"}, loadOnStartup = 1)
public class HelloWorld extends SafeHttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        PrintWriter out = resp.getWriter();
        out.println("Hello World");

        try {
            InitialContext jndiContext = new InitialContext();
            DataSource ds = (DataSource) jndiContext.lookup("java:comp/env/jdbc/connPool");

            Connection conn = ds.getConnection("root", "password");
            Statement stmt = conn.createStatement();

            ResultSet results = stmt.executeQuery("SELECT NOW() AS time;");

            if (results.next()) {
                out.println("<br>results: " + results.getString("time") + "<br>");
            }
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }
}
