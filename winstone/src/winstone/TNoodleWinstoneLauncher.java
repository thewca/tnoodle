/*
 * Copyright 2003-2006 Rick Knowles <winstone-devel at lists sourceforge net>
 * Distributed under the terms of either:
 * - the common development and distribution license (CDDL), v1.0; or
 * - the GNU Lesser General Public License, v2.1 or later
 */
package winstone;

import java.io.IOException;
import java.net.ServerSocket;
import java.util.Map;

import net.gnehzr.tnoodle.server.AggressiveHttpListener;

/**
 * Unfortunately, winstone doesn't fail in any detectable way when it cannot bind to a port.
 * It instantiates an HttpListener which has a getServerSocket() method. To detect binding
 * failures, we build our own HttpListener subclass that returns an already bound socket,
 * rather than creating it on the fly.
 */
public class TNoodleWinstoneLauncher extends Launcher {

	private TNoodleWinstoneLauncher(Map<?, ?> args) throws IOException {
		super(args);
	}
	
	public static TNoodleWinstoneLauncher create(Map<?, ?> args, ServerSocket ss) throws IOException {
		AggressiveHttpListener.ss = ss;
		return new TNoodleWinstoneLauncher(args);
	}
	
	@Override
	protected void spawnListener(String listenerClassName) {
		if(listenerClassName == Launcher.HTTP_LISTENER_CLASS) {
			listenerClassName = AggressiveHttpListener.class.getCanonicalName();
		}
		super.spawnListener(listenerClassName);
	}
	
}
