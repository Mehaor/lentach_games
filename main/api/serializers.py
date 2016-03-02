from rest_framework.serializers import ModelSerializer
from main.models import Game


class GameSerializer(ModelSerializer):
    class Meta:
        model = Game
        fields = ('slug', 'name', 'description', 'url', 'created_at')
        lookup_field = 'slug'
        extra_kwargs = {
            'url': {'lookup_field': 'slug'}
        }



