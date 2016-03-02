from rest_framework import viewsets, permissions
from main.models import Game
from serializers import GameSerializer


class GameViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Game.objects.filter(is_shutdown=False, is_published=True)
    serializer_class = GameSerializer
    lookup_field = 'slug'
