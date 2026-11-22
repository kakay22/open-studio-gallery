import json, re
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.http import HttpResponse, JsonResponse
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from .models import Profile, Asset

NAME_RE = re.compile(r'^[\w .-]{3,18}$')

def body(request):
    try:
        b = json.loads(request.body or b'{}')
        return b if isinstance(b, dict) else {}
    except ValueError:
        return {}

def err(msg, status=400):
    return JsonResponse({'error': msg}, status=status)

@ensure_csrf_cookie
@require_http_methods(['GET'])
def me(request):
    if not request.user.is_authenticated:
        return JsonResponse({'user': None})
    return JsonResponse({'user': request.user.profile.as_json()})

@require_http_methods(['POST'])
def register(request):
    b = body(request)
    username = str(b.get('username') or '').strip()[:30]
    email = str(b.get('email') or '').strip().lower()[:120]
    password = str(b.get('password') or '')
    display = str(b.get('displayName') or username).strip()
    if not re.match(r'^[\w.-]{3,30}$', username): return err('Username: 3-30 letters, numbers, . _ -')
    if '@' not in email: return err('Enter a valid email')
    if not NAME_RE.match(display): return err('Display name: 3-18 characters')
    if User.objects.filter(username__iexact=username).exists(): return err('Username taken', 409)
    if User.objects.filter(email__iexact=email).exists(): return err('Email already registered', 409)
    if Profile.objects.filter(display_name__iexact=display).exists(): return err('Display name taken', 409)
    try: validate_password(password)
    except ValidationError as e: return err(' '.join(e.messages))
    u = User.objects.create_user(username=username, email=email, password=password)
    Profile.objects.create(user=u, display_name=display, look=b.get('look') if isinstance(b.get('look'), dict) else {})
    login(request, u)
    return JsonResponse({'user': u.profile.as_json()})

@require_http_methods(['POST'])
def login_view(request):
    b = body(request)
    ident = str(b.get('username') or '').strip()
    u = User.objects.filter(email__iexact=ident).first() if '@' in ident else None
    u = authenticate(request, username=u.username if u else ident, password=str(b.get('password') or ''))
    if not u: return err('Wrong username or password', 401)
    login(request, u)
    return JsonResponse({'user': u.profile.as_json()})

@require_http_methods(['POST'])
def logout_view(request):
    logout(request)
    return HttpResponse(status=204)

@require_http_methods(['POST'])
def profile_update(request):
    if not request.user.is_authenticated: return err('Login required', 401)
    b, p = body(request), request.user.profile
    if 'displayName' in b:
        d = str(b['displayName']).strip()
        if not NAME_RE.match(d): return err('Display name: 3-18 characters')
        if Profile.objects.filter(display_name__iexact=d).exclude(pk=p.pk).exists(): return err('Display name taken', 409)
        p.display_name = d
    if isinstance(b.get('look'), dict):
        p.look = {k: b['look'].get(k) for k in ('g', 'sk', 'hr', 'hu')}
    if isinstance(b.get('avatarId'), str) and Asset.objects.filter(pk=b['avatarId']).exists():
        p.avatar = b['avatarId']          # upload the file first via /api/assets
    p.save()
    return JsonResponse({'user': p.as_json()})

@require_http_methods(['POST'])
def reset_request(request):
    email = str(body(request).get('email') or '').strip().lower()
    u = User.objects.filter(email__iexact=email).first()
    if u:
        uid, tok = urlsafe_base64_encode(force_bytes(u.pk)), default_token_generator.make_token(u)
        send_mail('Reset your Gallery password',
                  f'Open this link to choose a new password:\n{request.build_absolute_uri("/")}?reset={uid}.{tok}',
                  None, [u.email])
    return HttpResponse(status=204)      # same answer whether or not the email exists

@require_http_methods(['POST'])
def reset_confirm(request):
    b = body(request)
    try:
        uid, tok = str(b.get('token')).split('.', 1)
        u = User.objects.get(pk=force_str(urlsafe_base64_decode(uid)))
    except Exception:
        return err('Invalid link')
    if not default_token_generator.check_token(u, tok): return err('Link expired')
    try: validate_password(str(b.get('password') or ''), u)
    except ValidationError as e: return err(' '.join(e.messages))
    u.set_password(b['password']); u.save()
    return HttpResponse(status=204)