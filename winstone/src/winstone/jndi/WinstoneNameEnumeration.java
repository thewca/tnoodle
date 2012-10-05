/*
 * Copyright 2003-2006 Rick Knowles <winstone-devel at lists sourceforge net>
 * Distributed under the terms of either:
 * - the common development and distribution license (CDDL), v1.0; or
 * - the GNU Lesser General Public License, v2.1 or later
 */
package winstone.jndi;

import java.util.Arrays;
import java.util.Enumeration;
import java.util.Map;
import java.util.Vector;

import javax.naming.NameClassPair;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;

/**
 * Enumeration across the names/classes of the bindings in a particular context.
 * Used by the list() method.
 * 
 * @author <a href="mailto:rick_knowles@hotmail.com">Rick Knowles</a>
 * @version $Id: WinstoneNameEnumeration.java,v 1.3 2006/02/28 07:32:48 rickknowles Exp $
 */
@SuppressWarnings({ "rawtypes", "unchecked" })
public class WinstoneNameEnumeration implements NamingEnumeration {
    private Enumeration nameEnumeration;
    
    /**
     * Constructor
     */
    public WinstoneNameEnumeration(Map bindings) {
        Object keys[] = bindings.keySet().toArray();
        Arrays.sort(keys);
        Vector nameClassPairs = new Vector();
        for (int n = 0; n < keys.length; n++)
            nameClassPairs.add(new NameClassPair((String) keys[n], bindings
                    .get(keys[n]).getClass().getName()));
        this.nameEnumeration = nameClassPairs.elements();
    }

    public void close() throws NamingException {
        this.nameEnumeration = null;
    }

    public boolean hasMore() throws NamingException {
        if (this.nameEnumeration == null)
            throw new NamingException(ContainerJNDIManager.JNDI_RESOURCES
                    .getString("WinstoneNameEnumeration.AlreadyClosed"));
        else
            return this.nameEnumeration.hasMoreElements();
    }

    public Object next() throws NamingException {
        if (hasMore())
            return this.nameEnumeration.nextElement();
        else
            return null;
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
