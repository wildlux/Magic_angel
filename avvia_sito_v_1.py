#!/usr/bin/env python3
import sys
import os
import socket
import time
import json
import re
import threading
import requests
from http.server import HTTPServer, SimpleHTTPRequestHandler

# ==========================================
# CONFIGURAZIONE
# ==========================================
PORT = 8000

# ⚠️ INCOLLA QUI L'URL DEL TUO WEB APP APPS SCRIPT
APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwc9wghe3aoKxf0IxBiqvnAyyyxuWkF0wuATI7Ho2zX/exec"

CACHE = {}
CACHE_DURATION = 60  # secondi


# ==========================================
# FETCH DA APPS SCRIPT
# ==========================================
def fetch_config():
    try:
        # allow_redirects=True è IMPORTANTE: Apps Script risponde con un 302
        res = requests.get(APPS_SCRIPT_URL, timeout=15, allow_redirects=True)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        print(f"[ERRORE FETCH] {e}")
        return None


def get_config_cached():
    now = time.time()
    if "config" in CACHE and now - CACHE["timestamp"] < CACHE_DURATION:
        return CACHE["config"]

    print("[PYTHON] Rigenero config da Google Apps Script...")
    config = fetch_config()
    if config is None:
        config = CACHE.get("config", {"error": "Impossibile caricare config"})

    CACHE["config"] = config
    CACHE["timestamp"] = now
    return config


# ==========================================
# SERVER HTTP
# ==========================================
class CustomHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Rotta /config.json
        if self.path == "/config.json" or self.path.startswith("/config.json?"):
            try:
                config = get_config_cached()
                body = json.dumps(config, ensure_ascii=False).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(body)
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(f'{{"error": "{e}"}}'.encode("utf-8"))
            return

        # Rotta /api/refresh
        if self.path == "/api/refresh":
            CACHE.clear()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status": "cache cleared"}')
            return

        # Cache busting HTML
        if self.path.endswith(".html") or self.path == "/":
            file_path = self.translate_path(self.path)
            if os.path.exists(file_path) and os.path.isfile(file_path):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()

                    version = str(int(time.time()))
                    content = re.sub(
                        r'(<link[^>]+href=")([^"?]+\.css)(")',
                        lambda m: f"{m.group(1)}{m.group(2)}?v={version}{m.group(3)}",
                        content,
                    )
                    content = re.sub(
                        r'(<script[^>]+src=")([^"?]+\.js)(")',
                        lambda m: f"{m.group(1)}{m.group(2)}?v={version}{m.group(3)}",
                        content,
                    )

                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.send_header("Content-Length", str(len(content.encode("utf-8"))))
                    self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
                    self.end_headers()
                    self.wfile.write(content.encode("utf-8"))
                    return
                except Exception as e:
                    print(f"[ERRORE HTML] {e}")

        super().do_GET()

    def log_message(self, format, *args):
        pass


# ==========================================
# SERVER RIUTILIZZABILE (fix porta occupata)
# ==========================================
class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True


def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip


def avvia_server():
    ip_locale = get_local_ip()

    try:
        httpd = ReusableHTTPServer(("0.0.0.0", PORT), CustomHandler)
    except OSError:
        print(f"[ERRORE] La porta {PORT} è già occupata.")
        sys.exit(1)

    print("=" * 55)
    print("   SERVER WEB ATTIVO - MAGIC ANGEL")
    print("=" * 55)
    print(f"-> Locale:   http://localhost:{PORT}")
    print(f"-> In LAN:   http://{ip_locale}:{PORT}")
    print("-" * 55)
    print("COMANDI:")
    print("  [R] + Invio  ->  Riavvia + forza cache Google")
    print("  [Q] + Invio  ->  Esci")
    print("  Ctrl+C       ->  Esci")
    print("=" * 55)

    print("\n[PYTHON] Caricamento iniziale da Google Apps Script...")
    get_config_cached()

    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()

    try:
        while True:
            cmd = input().strip().lower()
            if cmd == "r":
                print("\n[OK] Riavvio + ricarico config...\n")
                CACHE.clear()
                httpd.shutdown()
                httpd.server_close()
                avvia_server()
                break
            elif cmd == "q":
                print("\n[OK] Uscita.")
                httpd.shutdown()
                httpd.server_close()
                sys.exit(0)
    except KeyboardInterrupt:
        print("\n\n[OK] Server arrestato (Ctrl+C).")
        httpd.shutdown()
        httpd.server_close()
        sys.exit(0)


if __name__ == "__main__":
    avvia_server()