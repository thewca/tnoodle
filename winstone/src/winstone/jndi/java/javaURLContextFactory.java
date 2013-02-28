/*
 * Copyright 2003-2006 Rick Knowles <winstone-devel at lists sourceforge net>
 * Distributed under the terms of either:
 * - the common development and distribution license (CDDL), v1.0; or
 * - the GNU Lesser General Public License, v2.1 or later
 */
package winstone.jndi.java;

import java.util.Hashtable;

import javax.naming.Context;
import javax.naming.Name;
import javax.naming.NamingException;
import javax.naming.spi.InitialContextFactory;
import javax.naming.spi.ObjectFactory;

import winstone.jndi.WinstoneContext;

/**
 * Creates the initial instance of the Winstone JNDI context (corresponds to
 * java:/ urls)
 *
 * @author <a href="mailto:rick_knowles@hotmail.com">Rick Knowles</a>
 * @version $Id: javaURLContextFactory.java,v 1.5 2007/04/23 02:55:35 rickknowles Exp $
 */
public class javaURLContextFactory implements InitialContextFactory, ObjectFactory {

    private static WinstoneContext rootContext;
    private Object lock = new Boolean(true);

    public Context getInitialContext(Hashtable env) throws NamingException {
        synchronized (lock) {
            if (rootContext == null) {
                Object lock = new Boolean(true);
                rootContext = new WinstoneContext(env, null, "java:", lock);
                WinstoneContext compCtx = new WinstoneContext(env, rootContext, "java:/comp", lock);
                WinstoneContext envCtx = new WinstoneContext(env, compCtx, "java:/comp/env", lock);
                rootContext.rebind("java:/comp", compCtx);
                compCtx.rebind("env", envCtx);
            }
        }
        return (Context) rootContext.lookup("java:/comp/env");
    }

    public Object getObjectInstance(Object object, Name name, Context context,
            Hashtable env) {
        return null;
    }
}
