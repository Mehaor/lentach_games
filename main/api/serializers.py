# coding: utf-8

from rest_framework import serializers
from main.models import User, Game


class UserSerializer(serializers.ModelSerializer):
    view_name = serializers.SerializerMethodField()

    def get_view_name(self, user):
        return u'{} {}'.format(user.first_name, user.last_name).strip() if user.first_name or user.last_name else user.username

    class Meta:
        model = User
        fields = ('view_name', 'avatar',)
        lookup_field = 'username'
        extra_kwargs = {
            'url': {'lookup_field': 'username'}
        }


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ('slug', 'name', 'description', 'url', 'created_at')
        lookup_field = 'slug'
        extra_kwargs = {
            'url': {'lookup_field': 'slug'}
        }



