import argparse
import sys

from http.server import HTTPServer, SimpleHTTPRequestHandler

# parse command line overrides
parser = argparse.ArgumentParser()
parser.add_argument("--host", type=str, default='0.0.0.0', help="bind address e.g. 0.0.0.0")
parser.add_argument("--port", type=int, default=8118,      help="bind address e.g. 8118")
parser.add_argument("--dir",  type=str, default='html',    help="HTML folder e.g. html")

args = parser.parse_args()
host = args.host
port = args.port
folder = args.dir

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs, directory=folder)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Access-Control-Allow-Methods', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        # self.send_header('Cache-Control', 'max-age=3600, must-revalidate')
        # self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')

        # favicons
        if self.path.startswith("/favicon."):
            self.send_header('Cache-Control', 'public, max-age=86400')
        else:
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')

        return super(CORSRequestHandler, self).end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

# serve HTTP requests
print("Listening on {}:{}".format(host, port))
httpd = HTTPServer((host, port), CORSRequestHandler)
httpd.serve_forever()

