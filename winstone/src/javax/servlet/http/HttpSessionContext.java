/*
 * Copyright 2003-2006 Rick Knowles <winstone-devel at lists sourceforge net>
 * Distributed under the terms of either:
 * - the common development and distribution license (CDDL), v1.0; or
 * - the GNU Lesser General Public License, v2.1 or later
 */
package javax.servlet.http;

/**
 * Shared session context interface - deprecated
 * 
 * @author <a href="mailto:rick_knowles@hotmail.com">Rick Knowles</a>
 * @deprecated
 */
@Deprecated
@SuppressWarnings({ "rawtypes" })
public abstract interface HttpSessionContext {
    /**
     * @deprecated
     */
    @Deprecated
    public abstract java.util.Enumeration getIds();

    /**
     * @deprecated
     */
    @Deprecated
    public abstract HttpSession getSession(String sessionId);

}
