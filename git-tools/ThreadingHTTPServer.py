import SocketServer
import BaseHTTPServer

#class ThreadingHTTPServer(SocketServer.ThreadingMixIn, BaseHTTPServer.HTTPServer):
    #pass
class ThreadingHTTPServer(SocketServer.ThreadingMixIn, BaseHTTPServer.HTTPServer):
    pass

if __name__ == "__main__":
  port = 8000
  import SimpleHTTPServer
  ThreadingHTTPServer(("", port), SimpleHTTPServer.SimpleHTTPRequestHandler).serve_forever()
