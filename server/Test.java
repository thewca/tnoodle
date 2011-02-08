import java.sql.*;
import org.h2.jdbcx.JdbcConnectionPool;

public class Test {
	public static void main(String[] args) throws Exception {
		JdbcConnectionPool cp = JdbcConnectionPool.create("jdbc:h2:test", "", "");

		Connection conn = cp.getConnection();
		Statement s = conn.createStatement();

		// schema...
		s.addBatch("CREATE TABLE IF NOT EXISTS Test (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255))");
		int[] results = s.executeBatch();

		// add to the table
		PreparedStatement ps = conn.prepareStatement("INSERT INTO Test (name) VALUES(?)");
		ps.setString(1, "Jeremy Fleischman");
		ps.executeUpdate();

		// query table
		ResultSet rs = s.executeQuery("SELECT * FROM Test");
		while(rs.next()) {
			System.out.print(rs.getString(1) + " ");
			System.out.println(rs.getString(2));
		}
		
		s.close();
		conn.close();



		cp.dispose();
	}
}
