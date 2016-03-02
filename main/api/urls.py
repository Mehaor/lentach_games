from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter

from main.api import views
router = DefaultRouter()
router.register('games', views.GameViewSet)
