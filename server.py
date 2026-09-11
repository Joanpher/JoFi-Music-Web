#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""JoFi Music · Servidor en capas.

- API:  /api/charts · /api/search · /api/song · /api/lyrics · /api/audio (proxy Range)
- Logs: /api/log  →  logs/error.log  (los clientes envían errores aquí en producción)
- Estáticos: sirve la PWA compilada (app/dist) con gzip
- Caché persistente en SQLite (compartida entre dispositivos y reinicios)
- Concurrencia: ThreadingHTTPServer (1 hilo por conexión) + lock para el trabajo pesado
"""
import gzip
import json
import os
import re
import sqlite3
import threading
import time
import tempfile
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import socket

import yt_dlp
from ytmusicapi import YTMusic

ROOT = Path(__file__).resolve().parent
APP_DIST = ROOT / 'app' / 'dist'
RUNTIME_DIR = Path(tempfile.gettempdir()) / 'jofi-music' if os.environ.get('VERCEL') else ROOT
LOG_DIR = RUNTIME_DIR / 'logs'
PORT = int(ROOT.joinpath('.port').read_text().strip()) if ROOT.joinpath('.port').exists() else 8000
DB_PATH = RUNTIME_DIR / 'playtube_cache.db'

TTL = {'charts': 3600, 'search': 3600, 'url': 5 * 3600, 'lyrics': 24 * 3600, 'lyrics_timed': 24 * 3600}

_mem = {}
_lock = threading.Lock()
_db_lock = threading.Lock()
_conn = None
_client = None

LOG_DIR.mkdir(parents=True, exist_ok=True)


def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def init_db():
    global _conn
    _conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    _conn.execute('PRAGMA journal_mode=WAL')
    _conn.execute('''CREATE TABLE IF NOT EXISTS cache(
        kind TEXT NOT NULL, key TEXT NOT NULL,
        dt REAL NOT NULL, text TEXT NOT NULL,
        PRIMARY KEY (kind, key))''')
    _conn.commit()


def cache_get(kind, key):
    now = time.time()
    with _lock:
        hit = _mem.get((kind, key))
        if hit and hit[0] > now:
            return hit[1]
    with _db_lock:
        row = _conn.execute(
            'SELECT dt, text FROM cache WHERE kind=? AND key=?', (kind, key)).fetchone()
        if row and row[0] > now:
            _mem[(kind, key)] = (row[0], json.loads(row[1]))
            return json.loads(row[1])
    return None


def cache_set(kind, key, ttl, value):
    exp = time.time() + ttl
    text = json.dumps(value, ensure_ascii=False)
    with _lock:
        _mem[(kind, key)] = (exp, value)
    with _db_lock:
        _conn.execute('INSERT OR REPLACE INTO cache(kind, key, dt, text) VALUES(?,?,?,?)',
                      (kind, key, exp, text))
        _conn.commit()


def cache_del(kind, key):
    with _lock:
        _mem.pop((kind, key), None)
    with _db_lock:
        _conn.execute('DELETE FROM cache WHERE kind=? AND key=?', (kind, key))
        _conn.commit()


def cached(kind, key, fn):
    hit = cache_get(kind, key)
    if hit is not None:
        return hit
    val = fn()
    cache_set(kind, key, TTL.get(kind, 3600), val)
    return val


def yt():
    global _client
    if _client is None:
        _client = YTMusic()
    return _client


def dur_sec(d):
    if isinstance(d, (int, float)):
        return int(d)
    if isinstance(d, str):
        m = re.match(r'(\d+):(\d+)', d)
        if m:
            return int(m.group(1)) * 60 + int(m.group(2))
    return 0


def meta_of(item):
    artists = [a.get('name') for a in (item.get('artists') or []) if a.get('name')]
    alb = item.get('album')
    album = alb.get('name') if isinstance(alb, dict) else (alb if isinstance(alb, str) else '')
    thumbs = item.get('thumbnails') or []
    thumb = ''
    if isinstance(thumbs, list) and thumbs:
        th = sorted(thumbs, key=lambda t: (t.get('width') or 0), reverse=True)[0]
        thumb = th.get('url') or ''
    return {
        'videoId': item.get('videoId', ''),
        'title': item.get('title') or 'Sin título',
        'artist': ', '.join(artists) or 'Desconocido',
        'album': album,
        'thumb': thumb,
        'duration': dur_sec(item.get('duration'))
    }


def get_charts(cc):
    def fn():
        with _lock:
            try:
                charts = yt().get_charts(country=cc)
            except Exception as e:
                log(f'charts fallback a US ({e})')
                charts = yt().get_charts(country='US')
            videos = charts.get('videos') or []
            best = None
            def rank(v):
                t = (v.get('title') or '').lower()
                return (0 if 'music videos' in t else 1 if 'music' in t else 2,
                        0 if 'live' not in t else 1,
                        0 if 'top' in t else 1)
            for v in sorted(videos, key=rank):
                if v.get('playlistId'):
                    best = v
                    break
            if not best:
                return {'cc': cc, 'title': 'Sin top disponible', 'songs': []}
            pl = yt().get_playlist(best['playlistId'], limit=60)
            songs = [meta_of(t) for t in (pl.get('tracks') or []) if t.get('videoId')]
            return {'cc': cc, 'title': best.get('title') or 'Top', 'songs': songs}
    return cached('charts', f'charts:{cc}', fn)


def search_music(q):
    def fn():
        with _lock:
            res = yt().search(q, filter='songs', limit=40)
            return [meta_of(r) for r in res if r.get('videoId')]
    return cached('search', f'search:{q.lower()}', fn)


_ydl_opts = {
    'format': 'bestaudio[ext=m4a]/bestaudio/best',
    'quiet': True,
    'no_warnings': True,
    'skip_download': True,
    'noplaylist': True,
}


def stream_url(video_id, refresh=False):
    def fn():
        with _lock:
            with yt_dlp.YoutubeDL(_ydl_opts) as ydl:
                info = ydl.extract_info(f'https://music.youtube.com/watch?v={video_id}', download=False)
            url = info.get('url')
            if not url:
                raise RuntimeError('yt-dlp no devolvió url de audio')
            return url
    if refresh:
        cache_del('url', f'url:{video_id}')
    try:
        return cached('url', f'url:{video_id}', fn)
    except Exception as e:
        raise RuntimeError(f'No se pudo extraer el audio: {e}')


def get_lyrics(video_id):
    def fn():
        with _lock:
            try:
                wp = yt().get_watch_playlist(video_id)
                lb = wp.get('lyrics')
                if isinstance(lb, dict):
                    lb = lb.get('browseId')
                if isinstance(lb, str) and lb:
                    ly = yt().get_lyrics(lb)
                    text = (ly or {}).get('lyrics')
                    if text:
                        return text
            except Exception as e:
                log(f'lyrics error: {e}')
        return None
    val = cached('lyrics', f'lyrics:{video_id}', fn)
    return val or None


LRC_RE = re.compile(r'\[(\d+):(\d+)(?:([.:,])(\d{1,3}))?\]')


def parse_lrc(text):
    """Convierte una letra LRC en líneas con tiempos (milisegundos)."""
    lines = []
    for raw in text.splitlines():
        markers = []
        for m in LRC_RE.finditer(raw):
            mins, secs = int(m.group(1)), int(m.group(2))
            frac = m.group(4)
            ms = int(frac) * (1000 // 10 ** len(frac)) if frac else 0
            markers.append(mins * 60000 + secs * 1000 + ms)
        if not markers:
            continue
        payload = LRC_RE.sub('', raw).strip()
        for ms in markers:
            lines.append((ms, payload))
    lines = [(ms, t) for ms, t in lines if t]
    lines.sort(key=lambda x: x[0])
    out = []
    for i, (start, text) in enumerate(lines):
        end = lines[i + 1][0] if i + 1 < len(lines) else start + 8000
        out.append({'startTimeMs': start, 'endTimeMs': end, 'text': text})
    return out


def get_timed_lyrics(artist, title):
    """Letras sincronizadas vía LRCLIB (LRC). None si no hay."""
    if not title:
        return None
    clean_artist = re.sub(r'\s*[\[(].*$', '', artist or '').strip()
    clean_title = re.sub(r'\s*[\[(].*$', '', title or '').strip()
    q = f'{clean_artist} {clean_title}'.strip()

    def fn():
        try:
            req = urllib.request.Request(
                f'https://lrclib.net/api/search?q={urllib.parse.quote(q)}',
                headers={'User-Agent': 'JoFiMusic/2.0'})
            with urllib.request.urlopen(req, timeout=15) as r:
                items = json.loads(r.read().decode('utf-8'))
        except Exception as e:
            log(f'lrclib error: {e}')
            return None
        if not isinstance(items, list):
            return None
        for it in items:
            if it.get('instrumental') or not it.get('syncedLyrics'):
                continue
            ln = parse_lrc(it.get('syncedLyrics'))
            if ln:
                return {'source': 'lrclib', 'lines': ln, 'plain': it.get('plainLyrics') or ''}
        # sin synced → que no se use como timed
        return None
    return cached('lyrics_timed', f'lrc:{q.lower()}', fn)


def write_error_file(entry):
    with _db_lock:
        with open(LOG_DIR / 'error.log', 'a', encoding='utf-8') as f:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')


def send_json(handler, data, status=200):
    body = json.dumps(data, ensure_ascii=False).encode('utf-8')
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json; charset=utf-8')
    handler.send_header('Content-Length', str(len(body)))
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.send_header('Cache-Control', 'no-store')
    handler.end_headers()
    handler.wfile.write(body)


COMPRESSIBLE = {'.html', '.css', '.js', '.json', '.svg', '.webmanifest', '.txt'}
MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.webmanifest': 'application/manifest+json',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.woff2': 'font/woff2',
    '.wasm': 'application/wasm',
}


class Handler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'
    server_version = 'JoFiMusicServer/2.0'

    def log_message(self, *args):
        pass

    def _query(self):
        return urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)

    def _send_static(self, fname):
        ctype = MIME.get(fname.suffix.lower(), 'application/octet-stream')
        data = fname.read_bytes()
        enc = None
        if fname.suffix.lower() in COMPRESSIBLE and len(data) >= 512:
            accept = self.headers.get('Accept-Encoding', '')
            if 'gzip' in accept:
                enc = 'gzip'
                data = gzip.compress(data, 6)
        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-cache')
        if enc:
            self.send_header('Content-Encoding', enc)
            self.send_header('Vary', 'Accept-Encoding')
        self.end_headers()
        self.wfile.write(data)

    def _serve_static(self, path):
        if path in ('/', ''):
            path = '/index.html'
        candidates = [APP_DIST / path.lstrip('/')]
        if not candidates[0].is_file() and APP_DIST.joinpath('index.html').is_file() and '.' not in path.split('/')[-1]:
            candidates.append(APP_DIST / 'index.html')
        if not APP_DIST.exists():
            # modo desarrollo: sirve los archivos viejos de la raíz como respaldo
            candidates.insert(0, ROOT / path.lstrip('/'))
        for f in candidates:
            try:
                f = f.resolve()
                f.relative_to(APP_DIST if APP_DIST.exists() else ROOT)
                if f.is_file():
                    self._send_static(f)
                    return
            except Exception:
                pass
        send_json(self, {'ok': False, 'error': 'no encontrado'}, 404)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        q = self._query()

        try:
            if path == '/api/charts':
                cc = (q.get('cc') or ['us'])[0].upper()
                data = get_charts(cc)
                send_json(self, {'ok': True, **data})
                return
            if path == '/api/search':
                qs = (q.get('q') or [''])[0]
                if not qs:
                    send_json(self, {'ok': False, 'error': 'sin query'}, 400)
                    return
                data = search_music(qs)
                send_json(self, {'ok': True, 'songs': data})
                return
            if path == '/api/song':
                vid = (q.get('id') or [''])[0]
                if not vid:
                    send_json(self, {'ok': False, 'error': 'sin id'}, 400)
                    return
                refresh = (q.get('refresh') or ['0'])[0] == '1'
                url = stream_url(vid, refresh=refresh)
                send_json(self, {'ok': True, 'videoId': vid, 'url': url})
                return
            if path == '/api/lyrics':
                vid = (q.get('id') or [''])[0]
                if not vid:
                    send_json(self, {'ok': False, 'error': 'sin id'}, 400)
                    return
                text = get_lyrics(vid)
                if text:
                    send_json(self, {'ok': True, 'lyrics': text})
                else:
                    send_json(self, {'ok': False, 'error': 'sin letras'}, 404)
                return
            if path == '/api/lyrics/timed':
                artist = (q.get('artist') or [''])[0]
                title = (q.get('title') or [''])[0]
                if not title:
                    send_json(self, {'ok': False, 'error': 'sin titulo'}, 400)
                    return
                data = get_timed_lyrics(artist, title)
                if data and data.get('lines'):
                    send_json(self, {'ok': True, **data})
                else:
                    send_json(self, {'ok': False, 'error': 'sin letras sincronizadas'}, 404)
                return
            if path == '/api/audio':
                u = (q.get('u') or [''])[0]
                if not u.startswith('https://') or 'googlevideo' not in u:
                    send_json(self, {'ok': False, 'error': 'url inválida'}, 400)
                    return
                self._proxy_audio(u)
                return
            if path == '/api/image':
                u = (q.get('u') or [''])[0]
                parsed_image = urllib.parse.urlparse(u)
                host = (parsed_image.hostname or '').lower()
                allowed = any(host == domain or host.endswith(f'.{domain}') for domain in (
                    'googleusercontent.com', 'ggpht.com', 'ytimg.com'
                ))
                if parsed_image.scheme != 'https' or not allowed:
                    send_json(self, {'ok': False, 'error': 'imagen inválida'}, 400)
                    return
                self._proxy_image(u)
                return
        except Exception as e:
            log(f'API error en {path}: {e}')
            send_json(self, {'ok': False, 'error': str(e)}, 502)
            return
        self._serve_static(path)

    def do_HEAD(self):
        self.do_GET()

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        if path != '/api/log':
            send_json(self, {'ok': False, 'error': 'no encontrado'}, 404)
            return
        try:
            n = int(self.headers.get('Content-Length') or 0)
            body = self.rfile.read(n) if n else b'{}'
            entry = json.loads(body or b'{}')
            if entry.get('level') in ('error', 'warn'):
                write_error_file(entry)
                if entry.get('level') == 'error':
                    log(f"client log → {str(entry.get('msg'))[:160]}")
        except Exception as e:
            log(f'post log error: {e}')
        send_json(self, {'ok': True})

    def _proxy_audio(self, url):
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0',
            'Range': self.headers.get('Range') or 'bytes=0-',
        })
        try:
            upstream = urllib.request.urlopen(req, timeout=45)
        except Exception as e:
            log(f'proxy error: {e}')
            self.send_response(502)
            self.end_headers()
            self.wfile.write(str(e).encode())
            return
        ct = upstream.status
        self.send_response(ct if ct == 206 else 200)
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Type', upstream.headers.get('Content-Type', 'audio/mp4'))
        cl = upstream.headers.get('Content-Length')
        if cl:
            self.send_header('Content-Length', cl)
        cr = upstream.headers.get('Content-Range')
        if cr:
            self.send_header('Content-Range', cr)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        try:
            while True:
                chunk = upstream.read(128 * 1024)
                if not chunk:
                    break
                self.wfile.write(chunk)
        except (BrokenPipeError, ConnectionResetError):
            pass
        finally:
            upstream.close()

    def _proxy_image(self, url):
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://music.youtube.com/',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        })
        try:
            with urllib.request.urlopen(req, timeout=20) as upstream:
                content_type = upstream.headers.get('Content-Type', 'image/jpeg')
                if not content_type.lower().startswith('image/'):
                    raise RuntimeError('el proveedor no devolvió una imagen')
                data = upstream.read(8 * 1024 * 1024 + 1)
                if len(data) > 8 * 1024 * 1024:
                    raise RuntimeError('imagen demasiado grande')
        except Exception as e:
            log(f'image proxy error: {e}')
            send_json(self, {'ok': False, 'error': 'no se pudo cargar la portada'}, 502)
            return

        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'public, max-age=86400')
        self.end_headers()
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass


def lan_ips():
    ips = []
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ips.append(s.getsockname()[0])
        s.close()
    except Exception:
        pass
    try:
        host = socket.gethostbyname(socket.gethostname())
        if host not in ips:
            ips.append(host)
    except Exception:
        pass
    return ips


if __name__ == '__main__':
    init_db()
    srv = ThreadingHTTPServer(('0.0.0.0', PORT), Handler)
    srv.daemon_threads = True
    print('=' * 58)
    print('  JoFi Music v2 · backends ytmusicapi + yt-dlp · caché SQLite')
    print(f'  Este PC:      http://localhost:{PORT}')
    for ip in lan_ips():
        print(f'  Tu teléfono:  http://{ip}:{PORT}   (misma red Wi-Fi)')
    print('  Ctrl+C para salir')
    print('=' * 58, flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print('\nAdiós 👋')
