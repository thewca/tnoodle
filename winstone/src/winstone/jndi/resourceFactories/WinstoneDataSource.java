/*
 * Copyright 2003-2006 Rick Knowles <winstone-devel at lists sourceforge net>
 * Distributed under the terms of either:
 * - the common development and distribution license (CDDL), v1.0; or
 * - the GNU Lesser General Public License, v2.1 or later
 */
package winstone.jndi.resourceFactories;

import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.Driver;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.SQLFeatureNotSupportedException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.sql.DataSource;

import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import winstone.Logger;
import winstone.WebAppConfiguration;
import winstone.WinstoneResourceBundle;

/**
 * Implements a JDBC 2.0 pooling datasource. This is meant to act as a wrapper
 * around a JDBC 1.0 driver, just providing the pool management functions.
 * 
 * Supports keep alives, and check-connection-before-get options, as well 
 * as normal reclaimable pool management options like maxIdle, maxConnections and
 * startConnections. Additionally it supports poll-retry on full, which means the 
 * getConnection call will block and retry after a certain period when the pool
 * is maxed out (good for high load conditions).
 *
 * This class was originally drawn from the generator-runtime servlet framework and
 * modified to make it more JDBC-API only compliant.
 *
 * @author <a href="mailto:rick_knowles@hotmail.com">Rick Knowles</a>
 * @version $Id: WinstoneDataSource.java,v 1.8 2006/11/07 01:30:39 rickknowles Exp $
 */
public class WinstoneDataSource implements DataSource, Runnable {
    
    public static final WinstoneResourceBundle DS_RESOURCES = 
        new WinstoneResourceBundle("winstone.jndi.resourceFactories.LocalStrings");
    
    private String name;
    
    private String url;
    private Driver driver;
    private Properties connectProps;
    
    private int maxIdleCount;
    private int maxHeldCount;
    private int retryCount;
    private int retryPeriod;
    
    private String keepAliveSQL;
    private int keepAlivePeriod;
    private boolean checkBeforeGet;
    private int killInactivePeriod;
    
    private List usedWrappers;
    private List unusedRealConnections; // sempahore
    private List usedRealConnections;
    
    private Thread managementThread;

    private int loginTimeout;
    private PrintWriter logWriter;
    
    /**
     * Main constructor. Basically just calls the init method
     */
    public WinstoneDataSource(String name, Map args, ClassLoader loader) {
        this.name = name;
        
        this.usedWrappers = new ArrayList();
        this.usedRealConnections = new ArrayList();
        this.unusedRealConnections = new ArrayList();
        this.connectProps = new Properties();

        // Extract pool management properties
        this.keepAliveSQL = WebAppConfiguration.stringArg(args, "keepAliveSQL", "");
        this.keepAlivePeriod = WebAppConfiguration.intArg(args, "keepAlivePeriod", -1);
        this.checkBeforeGet = WebAppConfiguration.booleanArg(args, "checkBeforeGet", 
                !this.keepAliveSQL.equals(""));
        this.killInactivePeriod = WebAppConfiguration.intArg(args, "killInactivePeriod", -1);

        this.url = WebAppConfiguration.stringArg(args, "url", null);
        String driverClassName = WebAppConfiguration.stringArg(args, "driverClassName", "");
        if (args.get("username") != null)
            this.connectProps.put("user", args.get("username"));
        if (args.get("password") != null)
            this.connectProps.put("password", args.get("password"));

        this.maxHeldCount = WebAppConfiguration.intArg(args, "maxConnections", 20);
        this.maxIdleCount = WebAppConfiguration.intArg(args, "maxIdle", 10);
        int startCount = WebAppConfiguration.intArg(args, "startConnections", 1);
        
        this.retryCount = WebAppConfiguration.intArg(args, "retryCount", 1);
        this.retryPeriod = WebAppConfiguration.intArg(args, "retryPeriod", 1000);

        log(Logger.FULL_DEBUG, "WinstoneDataSource.Init", this.url, null);

        try {
            synchronized (this.unusedRealConnections) {
                if (!driverClassName.equals("")) {
                    Class driverClass = Class.forName(driverClassName.trim(), true, loader);
                    this.driver = (Driver) driverClass.newInstance();

                    for (int n = 0; n < startCount; n++) {
                        makeNewRealConnection(this.unusedRealConnections);
                    }
                }
            }
        } catch (Throwable err) {
            log(Logger.ERROR, "WinstoneDataSource.ErrorInCreate", this.name, err);
        }

        // Start management thread
        this.managementThread = new Thread(this, "DBConnectionPool management thread");
        this.managementThread.start();
    }

    /**
     * Close this pool - probably because we will want to re-init the pool
     */
    public void destroy() {
        if (this.managementThread != null) {
            this.managementThread.interrupt();
            this.managementThread = null;
        }

        synchronized (this.unusedRealConnections) {
            killPooledConnections(this.unusedRealConnections, 0);
            killPooledConnections(this.usedRealConnections, 0);
        }
        
        this.usedRealConnections.clear();
        this.unusedRealConnections.clear();
        this.usedWrappers.clear();
    }

    /**
     * Gets a connection with a specific username/password. These are not pooled.
     */
    public Connection getConnection(String username, String password)
            throws SQLException {
        Properties newProps = new Properties();
        newProps.put("user", username);
        newProps.put("password", password);
        Connection conn = this.driver.connect(this.url, newProps);
        WinstoneConnection wrapper = null;
        synchronized (this.unusedRealConnections) {
            wrapper = new WinstoneConnection(conn, this);
            this.usedWrappers.add(wrapper);
        }
        return wrapper;
    }

    public Connection getConnection() throws SQLException {
        return getConnection(this.retryCount);
    }
    
    /**
     * Get a read-write connection - preferably from the pool, but fresh if needed
     */
    protected Connection getConnection(int retriesAllowed) throws SQLException {
        Connection realConnection = null;
        
        synchronized (this.unusedRealConnections) {
            // If we have any spare, get it from the unused pool
            if (this.unusedRealConnections.size() > 0) {
                realConnection = (Connection) this.unusedRealConnections.get(0);
                this.unusedRealConnections.remove(realConnection);
                this.usedRealConnections.add(realConnection);
                log(Logger.FULL_DEBUG, "WinstoneDataSource.UsingPooled",
                        new String[] {"" + this.usedRealConnections.size(), 
                           "" + this.unusedRealConnections.size()}, null);
                try {
                    return prepareWrapper(realConnection);
                } catch (SQLException err) {
                    // Leave the realConnection as non-null, so we know prepareWrapper failed
                }
            }

            // If we are out (and not over our limit), allocate a new one
            else if (this.usedRealConnections.size() < maxHeldCount) {
                realConnection = makeNewRealConnection(this.usedRealConnections);
                log(Logger.FULL_DEBUG, "WinstoneDataSource.UsingNew",
                        new String[] {"" + this.usedRealConnections.size(), 
                           "" + this.unusedRealConnections.size()}, null);
                try {
                    return prepareWrapper(realConnection);
                } catch (SQLException err) {
                    // Leave the realConnection as non-null, so we know prepareWrapper failed
                }
            }
        }
        
        if (realConnection != null) {
            // prepareWrapper() must have failed, so call this method again
            realConnection = null;
            return getConnection(retriesAllowed);
        } else if (retriesAllowed <= 0) {
            // otherwise throw fail message - we've blown our limit
            throw new SQLException(DS_RESOURCES.getString("WinstoneDataSource.Exceeded", "" + maxHeldCount));
        } else {
            log(Logger.FULL_DEBUG, "WinstoneDataSource.Retrying", new String[] {
                    "" + maxHeldCount, "" + retriesAllowed, "" + retryPeriod}, null);
            
            // If we are here, it's because we need to retry for a connection
            try {
                Thread.sleep(retryPeriod);
            } catch (InterruptedException err) {}
            return getConnection(retriesAllowed - 1);
        }
    }

    private Connection prepareWrapper(Connection realConnection) throws SQLException {
        // Check before get()
        if (this.checkBeforeGet) {
            try {
                executeKeepAlive(realConnection);
            } catch (SQLException err) {
                // Dead connection, kill it and try again
                killConnection(this.usedRealConnections, realConnection);
                throw err;
            }
        }
        realConnection.setAutoCommit(false);
        WinstoneConnection wrapper = new WinstoneConnection(realConnection, this);
        this.usedWrappers.add(wrapper);
        return wrapper;
    }
    
    /**
     * Releases connections back to the pool
     */
    void releaseConnection(WinstoneConnection wrapper, Connection realConnection) throws SQLException {
        synchronized (this.unusedRealConnections) {
            if (wrapper != null) {
                this.usedWrappers.remove(wrapper);
            }
            if (realConnection != null) {
                if (this.usedRealConnections.contains(realConnection)) {
                    this.usedRealConnections.remove(realConnection);
                    this.unusedRealConnections.add(realConnection);
                    log(Logger.FULL_DEBUG, "WinstoneDataSource.Releasing",
                            new String[] {"" + this.usedRealConnections.size(), 
                               "" + this.unusedRealConnections.size()}, null);
                } else {
                    log(Logger.WARNING, "WinstoneDataSource.ReleasingUnknown", null);
                    realConnection.close();
                }
            }
        }
    }

    public int getLoginTimeout() {
        return this.loginTimeout;
    }

    public PrintWriter getLogWriter() {
        return this.logWriter;
    }

    public void setLoginTimeout(int timeout) {
        this.loginTimeout = timeout;
    }

    public void setLogWriter(PrintWriter writer) {
        this.logWriter = writer;
    }

    /**
     * Clean up and keep-alive thread.
     * Note - this needs a lot more attention to the semaphore use during keepAlive etc
     */
    public void run() {
        log(Logger.DEBUG, "WinstoneDataSource.MaintenanceStart", null);

        int keepAliveCounter = -1;
        int killInactiveCounter = -1;
        boolean threadRunning = true;

        while (threadRunning) {
            try {
                long startTime = System.currentTimeMillis();

                // Keep alive if the time is right
                if ((this.keepAlivePeriod != -1) && threadRunning) {
                    keepAliveCounter++;

                    if (this.keepAlivePeriod <= keepAliveCounter) {
                        synchronized (this.unusedRealConnections) {
                            executeKeepAliveOnUnused();
                        }
                        keepAliveCounter = 0;
                    }
                }
                
                if (Thread.interrupted()) {
                    threadRunning = false;
                }

                // Kill inactive connections if the time is right
                if ((this.killInactivePeriod != -1) && threadRunning) {
                    killInactiveCounter++;

                    if (this.killInactivePeriod <= killInactiveCounter) {
                        synchronized (this.unusedRealConnections) {
                            killPooledConnections(this.unusedRealConnections, this.maxIdleCount);
                        }

                        killInactiveCounter = 0;
                    }
                }

                if ((killInactiveCounter == 0) || (keepAliveCounter == 0)) {
                    log(Logger.FULL_DEBUG, "WinstoneDataSource.MaintenanceTime",
                            "" + (System.currentTimeMillis() - startTime), null);
                }

                if (Thread.interrupted()) {
                    threadRunning = false;
                } else {
                    Thread.sleep(60000); // sleep 1 minute
                }
                
                if (Thread.interrupted()) {
                    threadRunning = false;
                }
            } catch (InterruptedException err) {
                threadRunning = false;
                continue;
            }
        }

        log(Logger.DEBUG, "WinstoneDataSource.MaintenanceFinish", null);
    }

    /**
     * Executes keep alive for each of the connections in the supplied pool
     */
    protected void executeKeepAliveOnUnused() {
        // keep alive all unused roConns now
        List dead = new ArrayList();
        
        for (Iterator i = this.unusedRealConnections.iterator(); i.hasNext();) {
            Connection conn = (Connection) i.next();

            try {
                executeKeepAlive(conn);
            } catch (SQLException errSQL) {
                dead.add(conn);
            }
        }
        
        for (Iterator i = dead.iterator(); i.hasNext(); ) {
            killConnection(this.unusedRealConnections, (Connection) i.next());
        }
        
        log(Logger.FULL_DEBUG, "WinstoneDataSource.KeepAliveFinished", "" + 
                this.unusedRealConnections.size(), null);
    }

    protected void executeKeepAlive(Connection connection) throws SQLException {
        if (!this.keepAliveSQL.equals("")) {
            PreparedStatement qryKeepAlive = null;
            try {
                qryKeepAlive = connection.prepareStatement(keepAliveSQL);
                qryKeepAlive.execute();
            } catch (SQLException err) {
                log(Logger.WARNING, "WinstoneDataSource.KeepAliveFailed", err);
                throw err;
            } finally {
                if (qryKeepAlive != null) {
                    qryKeepAlive.close();
                }
            }
        }
    }

    /**
     * This makes a new rw connection. It assumes that the synchronization has taken
     * place in the calling code, so is unsafe for use outside this class.
     */
    protected Connection makeNewRealConnection(List pool) throws SQLException {
        if (this.url == null) {
            throw new SQLException("No JDBC URL supplied");
        }

        Connection realConnection = this.driver.connect(this.url, this.connectProps);
        pool.add(realConnection);
        log(Logger.FULL_DEBUG, "WinstoneDataSource.AddingNew", 
                new String[] {"" + this.usedRealConnections.size(), 
                "" + this.unusedRealConnections.size()}, null);

        return realConnection;
    }

    /**
     * Iterates through a list and kills off unused connections until we reach the
     * minimum idle count for that pool.
     */
    protected void killPooledConnections(List pool, int maxIdleCount) {
        // kill inactive unused roConns now
        int killed = 0;

        while (pool.size() > maxIdleCount) {
            killed++;
            Connection conn = (Connection) pool.get(0);
            killConnection(pool, conn);
        }

        if (killed > 0) {
            log(Logger.FULL_DEBUG, "WinstoneDataSource.Killed", "" + killed, null);
        }
    }
    
    private static void killConnection(List pool, Connection conn) {
        pool.remove(conn);
        try {
            conn.close();
        } catch (SQLException err) {
        }
    }
    
    private void log(int level, String msgKey, Throwable err) {
        if (getLogWriter() != null) {
            getLogWriter().println(DS_RESOURCES.getString(msgKey));
            if (err != null) {
                err.printStackTrace(getLogWriter());
            }
        } else {
            Logger.log(level, DS_RESOURCES, msgKey, err);
        }
    }
    
    private void log(int level, String msgKey, String arg, Throwable err) {
        if (getLogWriter() != null) {
            getLogWriter().println(DS_RESOURCES.getString(msgKey, arg));
            if (err != null) {
                err.printStackTrace(getLogWriter());
            }
        } else {
            Logger.log(level, DS_RESOURCES, msgKey, arg, err);
        }
    }
    
    private void log(int level, String msgKey, String arg[], Throwable err) {
        if (getLogWriter() != null) {
            getLogWriter().println(DS_RESOURCES.getString(msgKey, arg));
            if (err != null) {
                err.printStackTrace(getLogWriter());
            }
        } else {
            Logger.log(level, DS_RESOURCES, msgKey, arg, err);
        }
    }

    public String toString() {
        return DS_RESOURCES.getString("WinstoneDataSource.StatusMsg", 
                new String[] { this.name,
                "" + this.usedRealConnections.size(), 
                "" + this.unusedRealConnections.size()});
    }

	@Override
	public <T> T unwrap(Class<T> iface) throws SQLException {
		throw new NotImplementedException();
	}

	@Override
	public boolean isWrapperFor(Class<?> iface) throws SQLException {
		throw new NotImplementedException();
	}
	
	public Logger getParentLogger() throws SQLFeatureNotSupportedException {
		throw new NotImplementedException();
	}

}
