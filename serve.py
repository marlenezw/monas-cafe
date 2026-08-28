"""Static server with HTTP Range support so video scrubbing works."""
import http.server
import os
import re
import socketserver

PORT = 4173
ROOT = "/Users/marlenemhangami/monas-cafe"


class RangeHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        rng = self.headers.get("Range")
        if not rng:
            return super().send_head()

        m = re.match(r"bytes=(\d*)-(\d*)", rng.strip())
        if not m:
            return super().send_head()

        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()
        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404)
            return None

        size = os.fstat(f.fileno()).st_size
        first, last = m.group(1), m.group(2)

        if first == "":                       # suffix range: bytes=-500
            length = int(last or 0)
            start = max(0, size - length)
            end = size - 1
        else:
            start = int(first)
            end = int(last) if last else size - 1

        if start >= size:
            f.close()
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{size}")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return None

        end = min(end, size - 1)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()

        f.seek(start)
        remaining = end - start + 1
        while remaining > 0:
            chunk = f.read(min(64 * 1024, remaining))
            if not chunk:
                break
            try:
                self.wfile.write(chunk)
            except (BrokenPipeError, ConnectionResetError):
                break
            remaining -= len(chunk)
        f.close()
        return None

    def log_message(self, fmt, *args):
        pass


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    with Server(("127.0.0.1", PORT), RangeHandler) as httpd:
        print(f"serving {ROOT} on http://127.0.0.1:{PORT}", flush=True)
        httpd.serve_forever()
