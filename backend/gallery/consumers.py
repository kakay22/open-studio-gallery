import asyncio
import json
import uuid

from channels.generic.websocket import AsyncWebsocketConsumer

CLIENTS = {}          # connection id -> presence state (x, z, ry, name, look, emote...)
KEYS = ('x', 'z', 'y', 'ry', 'r', 'g', 'sk', 'hr', 'hu', 'w', 'em', 'name', 'pit', 'rp', 'mic')
CHANNELS = {}         # connection id -> channel name, used to send call setup messages to one person
_dirty = False
_task = None


async def _ticker(layer):
    """Broadcast everyone's position ~10 times a second, only when something changed."""
    global _dirty
    while True:
        await asyncio.sleep(0.1)
        if _dirty:
            _dirty = False
            peers = [{'id': k, 's': v} for k, v in CLIENTS.items()]
            await layer.group_send('gallery', {'type': 'relay', 'payload': {'t': 'peers', 'peers': peers}})


class GalleryConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        global _task
        self.pid = uuid.uuid4().hex[:8]
        CLIENTS[self.pid] = {}
        CHANNELS[self.pid] = self.channel_name
        await self.channel_layer.group_add('gallery', self.channel_name)
        await self.accept()
        await self.send(json.dumps({'t': 'hello', 'id': self.pid}))
        if _task is None or _task.done():
            _task = asyncio.create_task(_ticker(self.channel_layer))

    async def disconnect(self, code):
        global _dirty
        pid = getattr(self, 'pid', None)
        if pid:
            CLIENTS.pop(pid, None)
            CHANNELS.pop(pid, None)
            _dirty = True
        await self.channel_layer.group_discard('gallery', self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        global _dirty
        if not text_data or len(text_data) > 12000:
            return
        try:
            m = json.loads(text_data)
        except ValueError:
            return
        if not isinstance(m, dict):
            return
        t = m.get('t')
        if t == 'state' and isinstance(m.get('s'), dict):
            st = CLIENTS.setdefault(self.pid, {})
            for k in KEYS:
                if k in m['s']:
                    v = m['s'][k]
                    if isinstance(v, str):
                        v = v[:24]
                    if v is None or isinstance(v, (str, int, float)):
                        st[k] = v
            _dirty = True
        elif t in ('chat', 'react') and isinstance(m.get('data'), dict) and len(json.dumps(m['data'])) < 600:
            
            await self.channel_layer.group_send(
                'gallery', {'type': 'relay', 'payload': {'t': t, 'id': self.pid, 'data': m['data']}})

        elif t == 'rtc' and isinstance(m.get('data'), dict) and isinstance(m.get('to'), str):
            ch = CHANNELS.get(m['to'])
            if ch:
                await self.channel_layer.send(ch, {'type': 'relay', 'payload': {'t': 'rtc', 'id': self.pid, 'data': m['data']}})
                
    async def relay(self, event):
        await self.send(json.dumps(event['payload']))
