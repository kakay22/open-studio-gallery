import json
import re
import secrets
import time

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods

from .models import Painting, Asset

ASSET_RE = re.compile(r'^[a-f0-9]{16}\.(jpg|png)$')
MAX_IMAGE = 12 * 1024 * 1024


def notify():
    async_to_sync(get_channel_layer().group_send)(
        'gallery', {'type': 'relay', 'payload': {'t': 'paintings'}})


def num(v):
    try:
        v = float(v)
        return v if v > 0 else 1.0
    except (TypeError, ValueError):
        return 1.0


@require_http_methods(['POST'])
def assets(request):
    b = request.body
    if len(b) < 8 or len(b) > MAX_IMAGE:
        return HttpResponse(status=400)
    jpg, png = b[:2] == b'\xff\xd8', b[:2] == b'\x89P'
    if not (jpg or png):
        return HttpResponse(status=415)
    name = secrets.token_hex(8) + ('.jpg' if jpg else '.png')
    Asset.objects.create(name=name, data=b, ctype='image/jpeg' if jpg else 'image/png')
    return JsonResponse({'id': name, 'url': '/uploads/' + name})


@require_http_methods(['GET'])
def upload_file(request, name):
    a = Asset.objects.filter(pk=name).first()
    if not a:
        return HttpResponse(status=404)
    r = HttpResponse(bytes(a.data), content_type=a.ctype)
    r['Cache-Control'] = 'public, max-age=31536000, immutable'
    return r


@require_http_methods(['GET'])
def paintings(request):
    return JsonResponse([p.as_json() for p in Painting.objects.order_by('created')], safe=False)


@require_http_methods(['PUT', 'DELETE'])
def painting(request, pid):
    pid = re.sub(r'[^\w-]', '', pid)[:64]
    if request.method == 'PUT':
        try:
            b = json.loads(request.body or b'{}')
        except ValueError:
            return HttpResponse(status=400)
        if not isinstance(b, dict):
            return HttpResponse(status=400)
        asset = b.get('assetId')
        if not isinstance(asset, str) or not ASSET_RE.match(asset) or not Asset.objects.filter(pk=asset).exists():
            return HttpResponse(status=400)
        if not pid or Painting.objects.filter(pk=pid).exists():
            return HttpResponse(status=409)
        Painting.objects.create(
            id=pid, asset=asset, title=str(b.get('title') or '')[:60], artist=str(b.get('artist') or '')[:40],
            w=num(b.get('w')), h=num(b.get('h')), owner=str(b.get('owner') or '')[:40],
            created=int(time.time() * 1000))
        notify()
        return HttpResponse(status=204)
    p = Painting.objects.filter(pk=pid).first()
    if not p:
        return HttpResponse(status=404)
    if p.owner != request.GET.get('owner'):
        return HttpResponse(status=403)
    Asset.objects.filter(pk=p.asset).delete()
    p.delete()
    notify()
    return HttpResponse(status=204)
