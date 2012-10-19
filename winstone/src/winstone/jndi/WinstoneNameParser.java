/*
 * Copyright 2003-2006 Rick Knowles <winstone-devel at lists sourceforge net>
 * Distributed under the terms of either:
 * - the common development and distribution license (CDDL), v1.0; or
 * - the GNU Lesser General Public License, v2.1 or later
 */
package winstone.jndi;

import java.util.Properties;

import javax.naming.CompoundName;
import javax.naming.Name;
import javax.naming.NameParser;
import javax.naming.NamingException;

/**
 * The name parser for winstone jndi names
 * 
 * @author <a href="mailto:rick_knowles@hotmail.com">Rick Knowles</a>
 * @version $Id: WinstoneNameParser.java,v 1.2 2006/02/28 07:32:48 rickknowles Exp $
 */
public class WinstoneNameParser implements NameParser {
    private static final Properties syntax = new Properties();
    static {
        syntax.put("jndi.syntax.direction", "left_to_right");
        syntax.put("jndi.syntax.separator", "/");
        syntax.put("jndi.syntax.ignorecase", "false");
        syntax.put("jndi.syntax.escape", "\\");
        syntax.put("jndi.syntax.beginquote", "'");
    }

    public Name parse(String name) throws NamingException {
        return new CompoundName(name, syntax);
    }
}
