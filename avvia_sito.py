#!/usr/bin/env python3
import http.server
import socketserver
import socket
import sys
import time
import re
import os

# Configurazione
PORT = 8000
IP = "0.0.0.0"  # Ascolta su tutte le interfacce di rete

class GestoreRichieste(http.server.SimpleHTTPRequestHandler):
    """Gestore che forza il refresh della cache sui file statici."""
    
    def do_GET(self):
        # Se la richiesta è per un file HTML, modifichiamo il contenuto
        if self.path.endswith('.html') or self.path == '/':
            file_path = self.translate_path(self.path)
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Genera un timestamp unico per questa sessione
                    version = str(int(time.time()))
                    
                    # Aggiunge ?v=... a tutti i file CSS
                    content = re.sub(
                        r'(<link[^>]+href=")([^"]+\.css)(")',
                        lambda m: f'{m.group(1)}{m.group(2)}?v={version}{m.group(3)}',
                        content
                    )
                    # Aggiunge ?v=... a tutti i file JS
                    content = re.sub(
                        r'(<script[^>]+src=")([^"]+\.js)(")',
                        lambda m: f'{m.group(1)}{m.group(2)}?v={version}{m.group(3)}',
                        content
                    )
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'text/html; charset=utf-8')
                    self.send_header('Content-Length', str(len(content.encode('utf-8'))))
                    self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                    self.send_header('Pragma', 'no-cache')
                    self.send_header('Expires', '0')
                    self.end_headers()
                    self.wfile.write(content.encode('utf-8'))
                    return
                except Exception as e:
                    print(f"Errore nella modifica del file: {e}")
                    # Se fallisce, lascia che il server gestisca normalmente
                    return super().do_GET()
        
        # Per tutti gli altri file (CSS, JS, immagini), aggiungi header anti-cache
        # e poi chiama il metodo standard
        # Nota: qui NON inviamo manualmente la risposta, lasciamo che SimpleHTTPRequestHandler lo faccia
        # ma prima aggiungiamo gli header per evitare cache
        # In realtà, per semplicità, usiamo il metodo standard senza modifiche
        # (gli header di base includono già Last-Modified, ma il parametro ?v= cambia l'URL)
        super().do_GET()

class ServerConPortaRiusabile(socketserver.TCPServer):
    allow_reuse_address = True

def avvia_server():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind((IP, PORT))
    except OSError:
        print(f"[ERRORE] La porta {PORT} è occupata. Chiudilo e riprova.")
        sys.exit(1)

    # Ottiene l'IP locale della macchina
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip_locale = s.getsockname()[0]
    except Exception:
        ip_locale = "127.0.0.1"
    finally:
        s.close()

    try:
        with ServerConPortaRiusabile((IP, PORT), GestoreRichieste) as httpd:
            print("--- Server Web Attivo ---")
            print(f"-> Locale:  http://localhost:{PORT}")
            print(f"-> In rete: http://{ip_locale}:{PORT}")
            print("----------------------------------------")
            print("COMANDI:")
            print("  Premi [R] e Invio per RIAVVIARE (forza cache)")
            print("  Premi [Q] e Invio per USCITA")
            print("----------------------------------------")
            
            # Avvia il server in un thread separato per permettere l'input da tastiera
            import threading
            server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
            server_thread.start()

            try:
                while True:
                    choice = input().strip().lower()
                    if choice == 'r':
                        print("\n[OK] Riavvio del server in corso... (nuova cache)")
                        httpd.shutdown()
                        httpd.server_close()
                        print("[OK] Server fermato. Riavvio...\n")
                        avvia_server()  # Richiama la funzione per riavviare
                        break
                    elif choice == 'q':
                        print("\n[OK] Uscita dal server.")
                        httpd.shutdown()
                        httpd.server_close()
                        sys.exit(0)
            except KeyboardInterrupt:
                print("\n\n[OK] Server arrestato manualmente (Ctrl+C).")
                httpd.shutdown()
                httpd.server_close()
                sys.exit(0)
    except Exception as e:
        print(f"[ERRORE] Impossibile avviare il server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    avvia_server()