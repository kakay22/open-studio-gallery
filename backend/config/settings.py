import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent      # backend/
ROOT = BASE_DIR.parent                                  # project root (holds dist/)
DATA_DIR = Path(os.environ.get('DATA_DIR', ROOT / 'data'))
UPLOAD_DIR = DATA_DIR / 'uploads'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-insecure-change-me')
DEBUG = os.environ.get('DEBUG', '1') == '1'
ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get(
        'ALLOWED_HOSTS',
        'localhost,127.0.0.1,192.168.100.112'
    ).split(',')
    if h.strip()
]

CSRF_TRUSTED_ORIGINS = [
    o.strip().rstrip('/')
    for o in os.environ.get(
        'CSRF_TRUSTED_ORIGINS',
        'http://localhost:5173,http://127.0.0.1:5173,http://192.168.100.112:5173'
    ).split(',')
    if o.strip()
]

# Production (Render) sets PRODUCTION=1; local development leaves it unset.
if os.environ.get('PRODUCTION') == '1':
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True

    CSRF_COOKIE_SAMESITE = 'None'
    SESSION_COOKIE_SAMESITE = 'None'

    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


INSTALLED_APPS = [
    'daphne',
    'corsheaders',
    'channels',
    'gallery',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

CORS_ALLOWED_ORIGINS = [
    origin.strip().rstrip('/')
    for origin in os.environ.get(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:5173,http://127.0.0.1:5173'
    ).split(',')
    if origin.strip()
]

CORS_ALLOW_CREDENTIALS = True

ROOT_URLCONF = 'config.urls'
ASGI_APPLICATION = 'config.asgi.application'
import dj_database_url
DATABASES = {'default': dj_database_url.config(
    default=f"sqlite:///{DATA_DIR / 'db.sqlite3'}", conn_max_age=600, ssl_require=bool(os.environ.get('DATABASE_URL')))}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
DATA_UPLOAD_MAX_MEMORY_SIZE = 13 * 1024 * 1024

STATIC_URL = '/static/'
STATIC_ROOT = ROOT / 'staticfiles'
WHITENOISE_ROOT = ROOT / 'dist'      # the built React app (npm run build)
WHITENOISE_INDEX_FILE = True

# One process only: presence is kept in memory. Fine for a small gallery.
CHANNEL_LAYERS = {'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'}}
