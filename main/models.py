from __future__ import unicode_literals

from django.db import models

from lentach_games import settings


class Game(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=50, unique=True)
    description = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    cover_image = models.ImageField(null=True, blank=True)
    is_published = models.BooleanField(default=False)

    def __unicode__(self):
        return self.slug

