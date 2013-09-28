import socketserver
import http.server

#class ThreadingHTTPServer(SocketServer.ThreadingMixIn, BaseHTTPServer.HTTPServer):
    #pass
class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    pass

if __name__ == "__main__":
  port = 8000
  import http.server
  ThreadingHTTPServer(("", port), http.server.SimpleHTTPRequestHandler).serve_forever()
