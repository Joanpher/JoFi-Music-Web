"""Adaptador serverless de JoFi Music para Vercel."""

import urllib.parse

import server as backend


if backend._conn is None:
    backend.init_db()


class handler(backend.Handler):
    """Enruta /api/:route* al Handler usado por el servidor local."""

    def _restore_api_path(self):
        parsed = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed.query, keep_blank_values=True)
        route = (query.pop('route', [''])[0] or '').strip('/')
        if not route:
            return
        remaining = urllib.parse.urlencode(query, doseq=True)
        self.path = f'/api/{route}' + (f'?{remaining}' if remaining else '')

    def do_GET(self):
        self._restore_api_path()
        return super().do_GET()

    def do_HEAD(self):
        self._restore_api_path()
        return super().do_HEAD()

    def do_POST(self):
        self._restore_api_path()
        return super().do_POST()
