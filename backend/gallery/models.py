from django.db import models


class Painting(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    asset = models.CharField(max_length=40)
    title = models.CharField(max_length=60, blank=True)
    artist = models.CharField(max_length=40, blank=True)
    w = models.FloatField(default=1)
    h = models.FloatField(default=1)
    owner = models.CharField(max_length=40, blank=True)
    created = models.BigIntegerField()

    def as_json(self):
        return {'id': self.id, 'assetId': self.asset, 'url': '/uploads/' + self.asset,
                'title': self.title, 'artist': self.artist, 'w': self.w, 'h': self.h,
                'owner': self.owner, 'createdAt': self.created}


class Asset(models.Model):
    name = models.CharField(max_length=40, primary_key=True)
    data = models.BinaryField()
    ctype = models.CharField(max_length=20, default='image/jpeg')

from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=18, unique=True)
    avatar = models.CharField(max_length=40, blank=True)   # Asset name
    look = models.JSONField(default=dict)                  # {g, sk, hr, hu}

    def as_json(self):
        return {'id': str(self.user_id), 'username': self.user.username, 'displayName': self.display_name,
                'avatarUrl': ('/uploads/' + self.avatar) if self.avatar else '', 'look': self.look}