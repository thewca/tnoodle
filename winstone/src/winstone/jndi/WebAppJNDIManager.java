/*
 * Copyright 2003-2006 Rick Knowles <winstone-devel at lists sourceforge net>
 * Distributed under the terms of either:
 * - the common development and distribution license (CDDL), v1.0; or
 * - the GNU Lesser General Public License, v2.1 or later
 */
package winstone.jndi;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.w3c.dom.Node;

import winstone.Logger;
import winstone.WebAppConfiguration;

/**
 * Implements a simple web.xml + command line arguments style jndi manager
 *
 * @author <a href="mailto:rick_knowles@hotmail.com">Rick Knowles</a>
 * @version $Id: WebAppJNDIManager.java,v 1.9 2006/02/28 07:32:48 rickknowles Exp $
 */
public class WebAppJNDIManager extends ContainerJNDIManager {
    final static String ELEM_ENV_ENTRY = "env-entry";
    final static String ELEM_ENV_ENTRY_NAME = "env-entry-name";
    final static String ELEM_ENV_ENTRY_TYPE = "env-entry-type";
    final static String ELEM_ENV_ENTRY_VALUE = "env-entry-value";

    /**
     * Gets the relevant list of objects from the args, validating against the
     * web.xml nodes supplied. All node addresses are assumed to be relative to
     * the java:/comp/env context
     */
    public WebAppJNDIManager(Map args, List webXMLNodes, ClassLoader loader) {
        super(args, webXMLNodes, loader);

        // If the webXML nodes are not null, validate that all the entries we
        // wanted have been created
        if (webXMLNodes != null)
            for (Iterator i = webXMLNodes.iterator(); i.hasNext();) {
                Node node = (Node) i.next();

                // Extract the env-entry nodes and create the objects
                if (node.getNodeType() != Node.ELEMENT_NODE)
                    continue;
                else if (node.getNodeName().equals(ELEM_ENV_ENTRY)) {
                    String name = null;
                    String type = null;
                    String value = null;
                    for (int m = 0; m < node.getChildNodes().getLength(); m++) {
                        Node envNode = node.getChildNodes().item(m);
                        if (envNode.getNodeType() != Node.ELEMENT_NODE)
                            continue;
                        else if (envNode.getNodeName().equals(ELEM_ENV_ENTRY_NAME))
                            name = WebAppConfiguration.getTextFromNode(envNode);
                        else if (envNode.getNodeName().equals(ELEM_ENV_ENTRY_TYPE))
                            type = WebAppConfiguration.getTextFromNode(envNode);
                        else if (envNode.getNodeName().equals(ELEM_ENV_ENTRY_VALUE))
                            value = WebAppConfiguration.getTextFromNode(envNode);
                    }
                    if ((name != null) && (type != null) && (value != null)) {
                        Logger.log(Logger.FULL_DEBUG, JNDI_RESOURCES,
                                "WebAppJNDIManager.CreatingResourceWebXML",
                                name);
                        Object obj = createObject(name, type, value, args, loader);
                        if (obj != null)
                            this.objectsToCreate.put(name, obj);
                    }
                }
            }
    }

}
