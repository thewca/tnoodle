/*
 * Copyright 2003-2006 Rick Knowles <winstone-devel at lists sourceforge net>
 * Distributed under the terms of either:
 * - the common development and distribution license (CDDL), v1.0; or
 * - the GNU Lesser General Public License, v2.1 or later
 */
package winstone.jndi;

import java.util.ArrayList;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.naming.CompositeName;
import javax.naming.Context;
import javax.naming.Name;
import javax.naming.NameNotFoundException;
import javax.naming.NameParser;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.NotContextException;
import javax.naming.OperationNotSupportedException;
import javax.naming.spi.NamingManager;

import winstone.Logger;

/**
 * The main jndi context implementation class.
 * 
 * @author <a href="mailto:rick_knowles@hotmail.com">Rick Knowles</a>
 * @version $Id: WinstoneContext.java,v 1.3 2006/02/28 07:32:48 rickknowles Exp $
 */
public class WinstoneContext implements Context {
    static final String PREFIX = "java:";
    static final String FIRST_CHILD = "comp";
    static final String BODGED_PREFIX = "java:comp";
    
    private Hashtable environment;
    private Hashtable bindings;
    private final static NameParser nameParser = new WinstoneNameParser();
    private WinstoneContext parent;
    private String myAbsoluteName;
    private Object contextLock;

    /**
     * Constructor - sets up environment
     */
    public WinstoneContext(Map sourceEnvironment, WinstoneContext parent,
            String absoluteName, Object contextLock) throws NamingException {
        this.environment = new Hashtable();
        List sourceKeys = new ArrayList(sourceEnvironment.keySet());
        for (Iterator i = sourceKeys.iterator(); i.hasNext();) {
            String key = (String) i.next();
            addToEnvironment(key, sourceEnvironment.get(key));
        }
        this.parent = parent;
        this.myAbsoluteName = absoluteName;
        this.contextLock = contextLock;
        this.bindings = new Hashtable();
        Logger.log(Logger.FULL_DEBUG, ContainerJNDIManager.JNDI_RESOURCES,
                "WinstoneContext.Initialised", this.myAbsoluteName);
    }

    /**
     * Constructor - sets up environment and copies the bindings across
     */
    protected WinstoneContext(Map sourceEnvironment, WinstoneContext parent,
            String absoluteName, Object contextLock, Hashtable bindings) throws NamingException {
        this.environment = new Hashtable();
        List sourceKeys = new ArrayList(sourceEnvironment.keySet());
        for (Iterator i = sourceKeys.iterator(); i.hasNext();) {
            String key = (String) i.next();
            addToEnvironment(key, sourceEnvironment.get(key));
        }
        this.parent = parent;
        this.myAbsoluteName = absoluteName;
        this.contextLock = contextLock;
        this.bindings = bindings;
        Logger.log(Logger.FULL_DEBUG, ContainerJNDIManager.JNDI_RESOURCES, 
                "WinstoneContext.Copied", this.myAbsoluteName);
    }

    public void close() throws NamingException {
    }

    public Hashtable getEnvironment() throws NamingException {
        return new Hashtable(this.environment);
    }

    public Object removeFromEnvironment(String property) throws NamingException {
        return this.environment.remove(property);
    }

    public Object addToEnvironment(String property, Object value)
            throws NamingException {
        return this.environment.put(property, value);
    }

    /**
     * Handles the processing of relative and absolute names. If a relative name
     * is detected, it is processed by the name parser. If an absolute name is
     * detected, it determines first if the absolute name refers to this
     * context. If not, it then determines whether the request can be passed
     * back to the parent or not, and returns null if it can, and throws an
     * exception otherwise.
     */
    protected Name validateName(Name name) throws NamingException {
        // Check for absolute urls and redirect or correct
        if (name.isEmpty())
            return name;
        else if (name.get(0).equals(BODGED_PREFIX)) {
            Name newName = name.getSuffix(1).add(0, FIRST_CHILD).add(0, PREFIX);
            return validateName(newName);
        } else if (name.get(0).equals(PREFIX)) {
            String stringName = name.toString();
            if (stringName.equals(this.myAbsoluteName))
                return nameParser.parse("");
            else if (stringName.startsWith(this.myAbsoluteName))
                return nameParser.parse(stringName
                        .substring(this.myAbsoluteName.length() + 1));
            else if (this.parent != null)
                return null;
            else
                throw new NameNotFoundException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                        "WinstoneContext.NameNotFound", name.toString()));
        } else if (name instanceof CompositeName)
            return nameParser.parse(name.toString());
        else
            return name;
    }

    /**
     * Lookup an object in the context. Returns a copy of this context if the
     * name is empty, or the specified resource (if we have it). If the name is
     * unknown, throws a NameNotFoundException.
     */
    public Object lookup(Name name) throws NamingException {
        Name searchName = validateName(name);

        // If null, it means we don't know how to handle this -> throw to the
        // parent
        if (searchName == null)
            return this.parent.lookup(name);
        // If empty name, return a copy of this Context
        else if (searchName.isEmpty())
            return new WinstoneContext(this.environment, this.parent,
                    this.myAbsoluteName, this.contextLock, this.bindings);

        String thisName = searchName.get(0);
        synchronized (this.contextLock) {
            Object thisValue = bindings.get(thisName);

            // If the name points to something in this level, try to find it,
            // and give
            // an error if not available
            if (searchName.size() == 1) {
                if (thisValue == null)
                    throw new NameNotFoundException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                            "WinstoneContext.NameNotFound", name.toString()));

                try {
                    return NamingManager.getObjectInstance(thisValue,
                            new CompositeName().add(thisName), this,
                            this.environment);
                } catch (Exception e) {
                    NamingException ne = new NamingException(ContainerJNDIManager.JNDI_RESOURCES
                            .getString("WinstoneContext.FailedToGetInstance"));
                    ne.setRootCause(e);
                    throw ne;
                }
            }

            else if (thisValue == null)
                throw new NameNotFoundException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                        "WinstoneContext.NameNotFound", thisName.toString()));

            // If it's not in this level and what we found is not a context,
            // complain
            else if (!(thisValue instanceof Context))
                throw new NotContextException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                        "WinstoneContext.NotContext", new String[] {
                                thisName.toString(),
                                thisValue.getClass().getName() }));

            // Open the context, perform a lookup, then close the context we
            // opened
            else
                try {
                    return ((Context) thisValue)
                            .lookup(searchName.getSuffix(1));
                } finally {
                    ((Context) thisValue).close();
                }
        }
    }

    public Object lookup(String name) throws NamingException {
        return lookup(new CompositeName(name));
    }

    public Object lookupLink(Name name) throws NamingException {
        Logger.log(Logger.WARNING, ContainerJNDIManager.JNDI_RESOURCES,
                "WinstoneContext.LinkRefUnsupported");
        return lookup(name);
    }

    public Object lookupLink(String name) throws NamingException {
        return lookupLink(new CompositeName(name));
    }

    /**
     * Returns a list of objects bound to the context
     */
    public NamingEnumeration list(Name name) throws NamingException {
        Name searchName = validateName(name);

        // If null, it means we don't know how to handle this -> throw to the
        // parent
        if (searchName == null)
            return this.parent.list(name);
        // If empty name, return a copy of this Context
        else if (searchName.isEmpty()) {
            NamingEnumeration e = null;
            synchronized (this.contextLock) {
                e = new WinstoneNameEnumeration(this.bindings);
            }
            return e;
        }

        // Lookup the object - if it's not a context, throw an error
        else {
            Object ctx = this.lookup(searchName);
            if (ctx instanceof Context)
                try {
                    return ((Context) ctx).list(new CompositeName(""));
                } finally {
                    ((Context) ctx).close();
                }
            else if (ctx == null)
                throw new NameNotFoundException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                        "WinstoneContext.NameNotFound", searchName.toString()));
            else
                throw new NotContextException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                        "WinstoneContext.NotContext",
                        new String[] { searchName.toString(),
                                ctx.getClass().getName() }));
        }
    }

    public NamingEnumeration list(String name) throws NamingException {
        return list(new CompositeName(name));
    }

    public NamingEnumeration listBindings(Name name) throws NamingException {
        Name searchName = validateName(name);

        // If null, it means we don't know how to handle this -> throw to the
        // parent
        if (searchName == null)
            return this.parent.list(name);
        // If empty name, return a copy of this Context
        else if (searchName.isEmpty()) {
            NamingEnumeration e = null;
            synchronized (this.contextLock) {
                e = new WinstoneBindingEnumeration(this.bindings,
                        this.environment, this);
            }
            return e;
        }

        // Lookup the object - if it's not a context, throw an error
        else {
            Object ctx = this.lookup(searchName);
            if (ctx instanceof Context)
                try {
                    return ((Context) ctx).listBindings(new CompositeName(""));
                } finally {
                    ((Context) ctx).close();
                }
            else if (ctx == null)
                throw new NameNotFoundException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                        "WinstoneContext.NameNotFound", searchName.toString()));
            else
                throw new NotContextException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                        "WinstoneContext.NotContext",
                        new String[] { searchName.toString(),
                                ctx.getClass().getName() }));
        }
    }

    public NamingEnumeration listBindings(String name) throws NamingException {
        return listBindings(new CompositeName(name));
    }

    public NameParser getNameParser(Name name) throws NamingException {
        Object obj = lookup(name);
        if (obj instanceof Context) {
            ((Context) obj).close();
        }
        return nameParser;
    }

    public NameParser getNameParser(String name) throws NamingException {
        return getNameParser(new CompositeName(name));
    }

    public String getNameInNamespace() throws NamingException {
        return this.myAbsoluteName;
    }

    /***************************************************************************
     * Below here is for read-write contexts ... *
     **************************************************************************/

    public void bind(String name, Object value) throws NamingException {
        bind(new CompositeName(name), value);
    }

    public void bind(Name name, Object value) throws NamingException {
        bind(name, value, false);
    }

    protected void bind(Name name, Object value, boolean allowOverwrites)
            throws NamingException {
        Name bindName = validateName(name);

        // If null, it means we don't know how to handle this -> throw to the
        // parent
        if (bindName == null)
            this.parent.bind(name, value, allowOverwrites);
        // If empty name, complain - we should have a child name here
        else if (bindName.isEmpty())
            throw new NamingException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                    "WinstoneContext.AlreadyExists", name.toString()));
        else if (bindName.size() > 1) {
            Object ctx = lookup(bindName.get(0));
            if (!(ctx instanceof Context))
                throw new NotContextException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                        "WinstoneContext.NotContext", new String[] {
                                bindName.get(0), ctx.getClass().getName() }));
            else if (ctx == null)
                throw new NameNotFoundException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                        "WinstoneContext.NameNotFound", bindName.get(0)));
            else
                try {
                    if (allowOverwrites)
                        ((Context) ctx).rebind(bindName.getSuffix(1), value);
                    else
                        ((Context) ctx).bind(bindName.getSuffix(1), value);
                } finally {
                    ((Context) ctx).close();
                }
        } else if ((!allowOverwrites) && this.bindings.get(name.get(0)) != null)
            throw new NamingException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                    "WinstoneContext.AlreadyExists", name.toString()));
        else {
            value = NamingManager.getStateToBind(value, new CompositeName()
                    .add(bindName.get(0)), this, this.environment);
            synchronized (this.contextLock) {
                this.bindings.put(bindName.get(0), value);
            }
        }
    }

    public void rebind(String name, Object value) throws NamingException {
        rebind(new CompositeName(name), value);
    }

    public void rebind(Name name, Object value) throws NamingException {
        bind(name, value, true);
    }

    public void unbind(String name) throws NamingException {
        unbind(new CompositeName(name));
    }

    public void unbind(Name name) throws NamingException {
        Name unbindName = validateName(name);

        // If null, it means we don't know how to handle this -> throw to the
        // parent
        if (unbindName == null)
            this.parent.unbind(name);
        // If empty name, complain - we should have a child name here
        else if (unbindName.isEmpty())
            throw new NamingException(ContainerJNDIManager.JNDI_RESOURCES
                    .getString("WinstoneContext.CantUnbindEmptyName"));
        else if (unbindName.size() > 1) {
            Object ctx = lookup(unbindName.get(0));
            if (!(ctx instanceof Context))
                throw new NotContextException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                        "WinstoneContext.NotContext", new String[] {
                                unbindName.get(0), ctx.getClass().getName() }));
            else if (ctx == null)
                throw new NameNotFoundException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                        "WinstoneContext.NameNotFound", unbindName.get(0)));
            else
                try {
                    ((Context) ctx).unbind(unbindName.getSuffix(1));
                } finally {
                    ((Context) ctx).close();
                }
        } else if (this.bindings.get(name.get(0)) == null)
            throw new NamingException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                    "WinstoneContext.NameNotFound", name.toString()));
        else {
            synchronized (this.contextLock) {
                // Object removing = this.bindings.get(unbindName.get(0));
                this.bindings.remove(unbindName.get(0));
            }
        }
    }

    public void rename(Name oldName, Name newName) throws NamingException {
        throw new OperationNotSupportedException(
                "rename not supported in Winstone java:/ context");
    }

    public void rename(String oldName, String newName) throws NamingException {
        rename(new CompositeName(oldName), new CompositeName(newName));
    }

    public Context createSubcontext(String name) throws NamingException {
        return createSubcontext(new CompositeName(name));
    }

    public Context createSubcontext(Name name) throws NamingException {
        Name childName = validateName(name);

        // If null, it means we don't know how to handle this -> throw to the
        // parent
        if (childName == null)
            return this.parent.createSubcontext(name);
        // If empty name, complain - we should have a child name here
        else if (childName.isEmpty())
            throw new NamingException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                    "WinstoneContext.AlreadyExists", name.toString()));
        else if (childName.size() > 1) {
            Object ctx = lookup(childName.get(0));
            if (!(ctx instanceof Context))
                throw new NotContextException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                        "WinstoneContext.NotContext", new String[] {
                                childName.get(0), ctx.getClass().getName() }));
            else if (ctx == null)
                throw new NameNotFoundException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                        "WinstoneContext.NameNotFound", childName.get(0)));
            else
                try {
                    ((Context) ctx).createSubcontext(childName.getSuffix(1));
                } finally {
                    ((Context) ctx).close();
                }
        }

        Context childContext = null;
        synchronized (this.contextLock) {
            if (this.bindings.get(childName.get(0)) != null)
                throw new NamingException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                        "WinstoneContext.AlreadyExists", childName.get(0)));
            else {
                childContext = new WinstoneContext(this.environment, this,
                        this.myAbsoluteName + "/" + childName.get(0),
                        new Boolean(true));
                this.bindings.put(childName.get(0), childContext);
            }
        }
        return childContext;
    }

    public void destroySubcontext(String name) throws NamingException {
        destroySubcontext(new CompositeName(name));
    }

    public void destroySubcontext(Name name) throws NamingException {
        Name childName = validateName(name);

        // If null, it means we don't know how to handle this -> throw to the parent
        if (childName == null)
            this.parent.destroySubcontext(name);
        // If absolutely referring to this context, tell the parent to delete this context
        else if (childName.isEmpty()) {
            if (!name.isEmpty())
                this.parent.destroySubcontext(name.getSuffix(name.size() - 2));
            else
                throw new NamingException(ContainerJNDIManager.JNDI_RESOURCES
                        .getString("WinstoneContext.CantDestroyEmptyName"));
        } else if (childName.size() > 1) {
            Object ctx = lookup(childName.get(0));
            if (!(ctx instanceof Context))
                throw new NotContextException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                        "WinstoneContext.NotContext", new String[] {
                                childName.get(0), ctx.getClass().getName() }));
            else if (ctx == null)
                throw new NameNotFoundException(ContainerJNDIManager.JNDI_RESOURCES.getString(
                        "WinstoneContext.NameNotFound", childName.get(0)));
            else
                try {
                    ((Context) ctx).destroySubcontext(childName.getSuffix(1));
                } finally {
                    ((Context) ctx).close();
                }
        } else
            synchronized (this.contextLock) {
                Context childContext = (Context) lookup(childName.get(0));
                childContext.close();
                this.bindings.remove(childName.get(0));
            }
    }

    public String composeName(String name1, String name2)
            throws NamingException {
        Name name = composeName(new CompositeName(name1), new CompositeName(
                name2));
        return name == null ? null : name.toString();
    }

    public Name composeName(Name name1, Name name2) throws NamingException {
        throw new OperationNotSupportedException(
                "composeName not supported in Winstone java:/ namespace");
    }
}
