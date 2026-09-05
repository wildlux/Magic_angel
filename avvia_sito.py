#!/usr/bin/env python3
import sys
import requests
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8000
APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzzxgAz4v36Zbt-CxDEf56Yt3ypBaKP3qpUUd4Mo0UulUA1WReiBtVU4KmJc0gpw9nH9g/exec"


class CustomHandler(SimpleHTTPRequestHandler):

    def do_GET(self):
        # Gestione della rotta API per le opinioni
        if self.path == "/api/opinioni":
            try:
                headers = {
                    "User-Agent": (
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
                    )
                }
                # allow_redirects=True segue il redirect 302 verso script.googleusercontent.com
                res = requests.get(
                    APPS_SCRIPT_URL,
                    headers=headers,
                    allow_redirects=True,
                    timeout=10,
                )

                self.send_response(200)
                self.send_header(
                    "Content-Type", "application/json; charset=utf-8"
                )
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(res.content)
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                error_msg = f'{{"error": "{str(e)}"}}'
                self.wfile.write(error_msg.encode("utf-8"))
        else:
            # Serve i file statici (HTML, CSS, JS, immagini) per qualsiasi altra rotta
            super().do_GET()


def run():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, CustomHandler)
    print(f"Server avviato su http://localhost:{PORT}")
    print("Premi CTRL+C per arrestarlo.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nArresto del server in corso...")
        httpd.server_close()
        sys.exit(0)


if __name__ == "__main__":
    run()