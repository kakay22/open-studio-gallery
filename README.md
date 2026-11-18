# Open Studio Gallery (React + Vite + Django)

A shared 3D gallery: walk around, hang paintings, chat, wave, dance, sit on the bench and react with emoji.
Frontend: React + Vite + three.js. Backend: Django + Channels (WebSockets for live presence/chat/reactions,
REST for paintings and uploads).

## Run locally (Python 3.10+, Node 18+)
    python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
    pip install -r requirements.txt
    cd backend && python manage.py migrate && python manage.py runserver 8000

In a second terminal, from the project root:

    npm install
    npm run dev          # open http://localhost:5173 (proxies /api, /uploads and /ws to Django on :8000)

## Host it (one process serves everything)
    npm install && npm run build            # creates dist/
    pip install -r requirements.txt
    cd backend
    export DEBUG=0 SECRET_KEY='a-long-random-string' ALLOWED_HOSTS='yourdomain.com'
    python manage.py migrate
    daphne -b 0.0.0.0 -p 8000 config.asgi:application

Daphne serves the site, API, uploads and WebSocket together; WhiteNoise serves the built React app.
Use a host that keeps a Python process running and supports WebSockets (Render, Railway, Fly.io, a VPS)
and put HTTPS in front (most hosts do this). Set `DATA_DIR` to a persistent disk: it holds the SQLite
database (`db.sqlite3`) and uploaded images (`uploads/`).

## Notes
- Run exactly one process/worker: live presence and the channel layer are in memory. To scale out, move
  presence to Redis and switch to `channels_redis`.
- Anyone who opens the site can upload. The painting "owner" is a random ID kept in the browser, so it stops
  accidental deletes but is not real security. Add logins and rate limits before a public launch.
- Uploaded images are served by Django itself, which is fine for a small gallery; put a CDN or nginx in front for heavy traffic.
- three.js is pinned to 0.128.0 because the engine uses its older color-encoding API.
- Files: `src/engine.js` (3D scene), `src/App.jsx` (HUD), `backend/gallery/` (models, REST views, WebSocket consumer).
