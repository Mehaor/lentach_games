# coding: utf-8

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    avatar = models.URLField(null=True, blank=True)

    def __unicode__(self):
        return self.username


class Game(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=50, unique=True)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    cover_image = models.ImageField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    is_shutdown = models.BooleanField(default=False)

    def __unicode__(self):
        return self.slug


class HiScore(models.Model):
    user = models.ForeignKey(User)
    game = models.ForeignKey(Game)
    value = models.IntegerField(default=0)

