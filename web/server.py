#!/usr/bin/env python3
"""
luang.in Local Sync Server (Cloud Simulation Mode)
Serves PWA static assets and provides persistent Store v2 sync API (/api/data)
with strict PIN authentication.
"""

import http.server
import json
import os
import sys
import socket

WEB_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(WEB_DIR, 'jadwalin_store.json')
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8081
PIN = os.environ.get('JADWALIN_PIN', '1234')


def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip


def normalize_store(data):
    if not isinstance(data, dict):
        data = {}
    tasks = data.get('tasks')
    if not isinstance(tasks, list):
        legacy = data.get('assignments')
        tasks = legacy if isinstance(legacy, list) else []

    return {
        'schemaVersion': 2,
        'profile': data.get('profile') or {
            'name': 'Rani Pratiwi',
            'role': 'Teknik Informatika • Semester 3',
            'dailyFocusGoalMinutes': 120
        },
        'settings': data.get('settings') or {
            'theme': 'classic',
            'pomoDuration': 25,
            'shortBreak': 5,
            'longBreak': 15,
            'notificationsEnabled': True
        },
        'lists': data.get('lists') or [
            {'id': 'inbox', 'name': 'Inbox', 'colorHex': '64748B'},
            {'id': 'kuliah', 'name': 'Kuliah', 'colorHex': '4772FA'},
            {'id': 'organisasi', 'name': 'Organisasi', 'colorHex': 'D97706'},
            {'id': 'pribadi', 'name': 'Pribadi', 'colorHex': '247B50'}
        ],
        'courses': data.get('courses') if isinstance(data.get('courses'), list) else [],
        'tasks': tasks,
        'habits': data.get('habits') if isinstance(data.get('habits'), list) else [],
        'focusSessions': data.get('focusSessions') if isinstance(data.get('focusSessions'), list) else [],
        'countdowns': data.get('countdowns') if isinstance(data.get('countdowns'), list) else []
    }


class LuangInHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, x-jadwalin-pin')
        clean_path = (self.path or '').split('?')[0]
        if clean_path in ('/sw.js', '/manifest.json'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Service-Worker-Allowed', '/')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def verify_pin(self):
        client_pin = (self.headers.get('x-jadwalin-pin') or '').strip().strip('"\'')
        expected_pin = PIN.strip().strip('"\'')
        if not client_pin or client_pin != expected_pin:
            self.send_response(401)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'status': 'unauthorized',
                'error': 'INVALID_PIN',
                'message': 'PIN akses salah atau belum dimasukkan.'
            }).encode('utf-8'))
            return False
        return True

    def do_GET(self):
        if self.path.startswith('/api/data'):
            if 'ping=true' in self.path:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'status': 'ok',
                    'appName': 'luang.in',
                    'schemaVersion': 2,
                    'storage': 'local_json',
                    'kvConnected': False
                }).encode('utf-8'))
                return

            if not self.verify_pin():
                return

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
            self.end_headers()

            if os.path.exists(DATA_FILE):
                try:
                    with open(DATA_FILE, 'r', encoding='utf-8') as f:
                        loaded = json.load(f)
                    normalized = normalize_store(loaded)
                    self.wfile.write(json.dumps(normalized, ensure_ascii=False).encode('utf-8'))
                    return
                except Exception as e:
                    print(f"Error reading {DATA_FILE}: {e}")

            default_payload = json.dumps(normalize_store({})).encode('utf-8')
            self.wfile.write(default_payload)
            return

        super().do_GET()

    def do_POST(self):
        if self.path == '/api/data':
            if not self.verify_pin():
                return

            content_length = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_length)

            try:
                raw_data = json.loads(post_body.decode('utf-8'))
                if not isinstance(raw_data, dict) or not isinstance(raw_data.get('courses'), list):
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'INVALID_PAYLOAD'}).encode('utf-8'))
                    return

                normalized = normalize_store(raw_data)
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    json.dump(normalized, f, indent=2, ensure_ascii=False)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'status': 'ok',
                    'storage': 'local_json',
                    'schemaVersion': 2
                }).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()


if __name__ == '__main__':
    local_ip = get_local_ip()
    server_address = ('0.0.0.0', PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, LuangInHandler)
    print("==================================================")
    print(f"  luang.in Local Sync Server (PORT: {PORT})")
    print(f"  Browser Mac : http://localhost:{PORT}")
    print(f"  Browser LAN : http://{local_ip}:{PORT}")
    print("==================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer dihentikan.")
        httpd.server_close()
