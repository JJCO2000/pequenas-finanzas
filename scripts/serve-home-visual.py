from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

ROOT = Path('dist').resolve()
os.chdir(ROOT)

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Cross-Origin-Resource-Policy', 'cross-origin')
        super().end_headers()

    def do_GET(self):
        path = self.translate_path(self.path)
        if not Path(path).exists() and '.' not in Path(self.path).name:
            self.path = '/index.html'
        super().do_GET()

ThreadingHTTPServer(('127.0.0.1', 8080), Handler).serve_forever()
