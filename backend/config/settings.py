import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent      # backend/
ROOT = BASE_DIR.parent                                  # project root (holds dist/)
DATA_DIR = Path(os.environ.get('DATA_DIR', ROOT / 'data'))
UPLOAD_DIR = DATA_DIR / 'uploads'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-insecure-change-me')
DEBUG = os.environ.get('DEBUG', '1') == '1'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = ['daphne', 'django.contrib.staticfiles', 'channels', 'gallery']
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.common.CommonMiddleware',
]
ROOT_URLCONF = 'config.urls'
ASGI_APPLICATION = 'config.asgi.application'
DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': DATA_DIR / 'db.sqlite3'}}
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
DATA_UPLOAD_MAX_MEMORY_SIZE = 13 * 1024 * 1024

STATIC_URL = '/static/'
STATIC_ROOT = ROOT / 'staticfiles'
WHITENOISE_ROOT = ROOT / 'dist'      # the built React app (npm run build)
WHITENOISE_INDEX_FILE = True

# One process only: presence is kept in memory. Fine for a small gallery.
CHANNEL_LAYERS = {'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'}}
