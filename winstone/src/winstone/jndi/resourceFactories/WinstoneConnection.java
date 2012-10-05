/*
 * Copyright 2003-2006 Rick Knowles <winstone-devel at lists sourceforge net>
 * Distributed under the terms of either:
 * - the common development and distribution license (CDDL), v1.0; or
 * - the GNU Lesser General Public License, v2.1 or later
 */
package winstone.jndi.resourceFactories;

import java.sql.Array;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.SQLWarning;
import java.sql.Savepoint;
import java.sql.Statement;
import java.sql.Struct;
import java.sql.NClob;
import java.sql.Clob;
import java.sql.Blob;
import java.sql.SQLXML;
import java.util.Map;
import java.util.Properties;

import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import winstone.Logger;

/**
 * JDBC Connection wrapper for use in the pooling datasource. This just suppresses 
 * the close() call, and releases the connection.
 * 
 * @author <a href="mailto:rick_knowles@hotmail.com">Rick Knowles</a>
 * @version $Id: WinstoneConnection.java,v 1.3 2006/02/28 07:32:48 rickknowles Exp $
 */
@SuppressWarnings({ "rawtypes", "unchecked" })
public class WinstoneConnection implements Connection {
    private Connection realConnection;
    private WinstoneDataSource datasource;

	public Struct createStruct(String typeName, Object[] attributes) {
		throw new NotImplementedException();
	}

	public Array createArrayOf(String typeName, Object[] elements) {
		throw new NotImplementedException();
	}

	public String getClientInfo(String name) {
		throw new NotImplementedException();
	}

	public Properties getClientInfo() {
		throw new NotImplementedException();
	}

	public void setClientInfo(String a, String b) {
		throw new NotImplementedException();
	}

	public void setClientInfo(Properties prop) {
		throw new NotImplementedException();
	}

	public boolean isValid(int timeout) {
		throw new NotImplementedException();
	}

	public SQLXML createSQLXML() {
		throw new NotImplementedException();
	}

	public NClob createNClob() {
		throw new NotImplementedException();
	}

	public Blob createBlob() {
		throw new NotImplementedException();
	}

	public Clob createClob() {
		throw new NotImplementedException();
	}

	public boolean isWrapperFor(Class iface) {
		throw new NotImplementedException();
	}

	public Object unwrap(Class iface) {
		throw new NotImplementedException();
	}



    /**
     * Constructor - this sets the real connection and the link back to the pool
     */
    public WinstoneConnection(Connection connection,
            WinstoneDataSource datasource) {
        this.realConnection = connection;
        this.datasource = datasource;
    }

    public void close() throws SQLException {
        if ((this.datasource != null) && (this.datasource.getLogWriter() != null)) {
            this.datasource.getLogWriter().println(
                    WinstoneDataSource.DS_RESOURCES.getString(
                            "WinstoneConnection.ReleaseRollback"));
        } else {
            Logger.log(Logger.FULL_DEBUG, WinstoneDataSource.DS_RESOURCES,
                    "WinstoneConnection.ReleaseRollback");
        }
        
        Connection realConnectionHolder = null;
        try {
            if (this.realConnection != null) {
                realConnectionHolder = this.realConnection;
                this.realConnection = null;
                
                if (!realConnectionHolder.getAutoCommit())
                    realConnectionHolder.rollback();
            }
        } finally {
            if ((this.datasource != null) && (realConnectionHolder != null)) {
                this.datasource.releaseConnection(this, realConnectionHolder);
                this.datasource = null;
            }
        }
    }

    public boolean isClosed() throws SQLException {
        return (this.realConnection == null);
    }

    public void commit() throws SQLException {
        this.realConnection.commit();
    }

    public void rollback() throws SQLException {
        this.realConnection.rollback();
    }

    public void rollback(Savepoint sp) throws SQLException {
        this.realConnection.rollback(sp);
    }

    public boolean getAutoCommit() throws SQLException {
        return this.realConnection.getAutoCommit();
    }

    public void setAutoCommit(boolean autoCommit) throws SQLException {
        this.realConnection.setAutoCommit(autoCommit);
    }

    public int getHoldability() throws SQLException {
        return this.realConnection.getHoldability();
    }

    public void setHoldability(int hold) throws SQLException {
        this.realConnection.setHoldability(hold);
    }

    public int getTransactionIsolation() throws SQLException {
        return this.realConnection.getTransactionIsolation();
    }

    public void setTransactionIsolation(int level) throws SQLException {
        this.realConnection.setTransactionIsolation(level);
    }

    public void clearWarnings() throws SQLException {
        this.realConnection.clearWarnings();
    }

    public SQLWarning getWarnings() throws SQLException {
        return this.realConnection.getWarnings();
    }

    public boolean isReadOnly() throws SQLException {
        return this.realConnection.isReadOnly();
    }

    public void setReadOnly(boolean ro) throws SQLException {
        this.realConnection.setReadOnly(ro);
    }

    public String getCatalog() throws SQLException {
        return this.realConnection.getCatalog();
    }

    public void setCatalog(String catalog) throws SQLException {
        this.realConnection.setCatalog(catalog);
    }

    public DatabaseMetaData getMetaData() throws SQLException {
        return this.realConnection.getMetaData();
    }

    public Savepoint setSavepoint() throws SQLException {
        return this.realConnection.setSavepoint();
    }

    public Savepoint setSavepoint(String name) throws SQLException {
        return this.realConnection.setSavepoint(name);
    }

    public void releaseSavepoint(Savepoint sp) throws SQLException {
        this.realConnection.releaseSavepoint(sp);
    }

    public Map getTypeMap() throws SQLException {
        return this.realConnection.getTypeMap();
    }

    public void setTypeMap(Map map) throws SQLException {
        this.realConnection.setTypeMap(map);
    }

    public String nativeSQL(String sql) throws SQLException {
        return this.realConnection.nativeSQL(sql);
    }

    public CallableStatement prepareCall(String sql) throws SQLException {
        return this.realConnection.prepareCall(sql);
    }

    public CallableStatement prepareCall(String sql, int resultSetType,
            int resultSetConcurrency) throws SQLException {
        return this.realConnection.prepareCall(sql, resultSetType,
                resultSetConcurrency);
    }

    public CallableStatement prepareCall(String sql, int resultSetType,
            int resultSetConcurrency, int resultSetHoldability)
            throws SQLException {
        return this.realConnection.prepareCall(sql, resultSetType,
                resultSetConcurrency, resultSetHoldability);
    }

    public Statement createStatement() throws SQLException {
        return this.realConnection.createStatement();
    }

    public Statement createStatement(int resultSetType, int resultSetConcurrency)
            throws SQLException {
        return this.realConnection.createStatement(resultSetType,
                resultSetConcurrency);
    }

    public Statement createStatement(int resultSetType,
            int resultSetConcurrency, int resultSetHoldability)
            throws SQLException {
        return this.realConnection.createStatement(resultSetType,
                resultSetConcurrency, resultSetHoldability);
    }

    public PreparedStatement prepareStatement(String sql) throws SQLException {
        return this.realConnection.prepareStatement(sql);
    }

    public PreparedStatement prepareStatement(String sql, int autogeneratedKeys)
            throws SQLException {
        return this.realConnection.prepareStatement(sql, autogeneratedKeys);
    }

    public PreparedStatement prepareStatement(String sql, int resultSetType,
            int resultSetConcurrency) throws SQLException {
        return this.realConnection.prepareStatement(sql, resultSetType,
                resultSetConcurrency);
    }

    public PreparedStatement prepareStatement(String sql, int resultSetType,
            int resultSetConcurrency, int resultSetHoldability)
            throws SQLException {
        return this.realConnection.prepareStatement(sql, resultSetType,
                resultSetConcurrency, resultSetHoldability);
    }

    public PreparedStatement prepareStatement(String sql, int[] columnIndexes)
            throws SQLException {
        return this.realConnection.prepareStatement(sql, columnIndexes);
    }

    public PreparedStatement prepareStatement(String sql, String[] columnNames)
            throws SQLException {
        return this.realConnection.prepareStatement(sql, columnNames);
    }
}
