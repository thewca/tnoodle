/*
 * Copyright 2003-2006 Rick Knowles <winstone-devel at lists sourceforge net>
 * Distributed under the terms of either:
 * - the common development and distribution license (CDDL), v1.0; or
 * - the GNU Lesser General Public License, v2.1 or later
 */
package winstone.jndi;

import java.util.Arrays;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Vector;

import javax.naming.Binding;
import javax.naming.CompositeName;
import javax.naming.Context;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.spi.NamingManager;

/**
 * Enumeration over the set of bindings for this context.
 * 
 * @author <a href="mailto:rick_knowles@hotmail.com">Rick Knowles</a>
 * @version $Id: WinstoneBindingEnumeration.java,v 1.3 2006/02/28 07:32:48 rickknowles Exp $
 */
@SuppressWarnings({ "rawtypes", "unchecked" })
public class WinstoneBindingEnumeration implements NamingEnumeration {
    private Enumeration nameEnumeration;
    private Hashtable bindings;
    private Hashtable contextEnvironment;
    private Context context;

    /**
     * Constructor - sets up the enumeration ready for retrieving bindings
     * instead of NameClassPairs.
     * 
     * @param bindings
     *            The source binding set
     */
    public WinstoneBindingEnumeration(Hashtable bindings,
            Hashtable environment, Context context) {
        Object keys[] = bindings.keySet().toArray();
        Arrays.sort(keys);
        Vector nameList = new Vector(Arrays.asList(keys));
        this.nameEnumeration = nameList.elements();
        this.bindings = (Hashtable) bindings.clone();
        this.context = context;
        this.contextEnvironment = environment;
    }

    public Object next() throws NamingException {
        if (this.nameEnumeration == null)
            throw new NamingException(ContainerJNDIManager.JNDI_RESOURCES
                    .getString("WinstoneBindingEnumeration.AlreadyClosed"));

        String name = (String) this.nameEnumeration.nextElement();
        Object value = this.bindings.get(name);
        try {
            value = NamingManager.getObjectInstance(value, new CompositeName()
                    .add(name), this.context, this.contextEnvironment);
        } catch (Throwable err) {
            NamingException errNaming = new NamingException(
                    ContainerJNDIManager.JNDI_RESOURCES
                            .getString("WinstoneBindingEnumeration.FailedToGetInstance"));
            errNaming.setRootCause(err);
            throw errNaming;
        }
        return new Binding(name, value);
    }

    public boolean hasMore() throws NamingException {
        if (this.nameEnumeration == null)
            throw new NamingException(ContainerJNDIManager.JNDI_RESOURCES
                    .getString("WinstoneBindingEnumeration.AlreadyClosed"));
        else
            return this.nameEnumeration.hasMoreElements();
    }

    public void close() throws NamingException {
        this.nameEnumeration = null;
    }

    public boolean hasMoreElements() {
        try {
            return hasMore();
        } catch (NamingException err) {
            return false;
        }
    }

    public Object nextElement() {
        try {
            return next();
        } catch (NamingException err) {
            return null;
        }
    }
}
