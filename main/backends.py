# coding: utf-8
from lentach_games import settings
from models import User
import requests
from requests.exceptions import RequestException
import uuid


class CustomAuthBackend(object):
    def authenticate(self, *args, **kwargs):
        user_data = self._get_user_data(*args, **kwargs)
        if user_data:
            return self._create_or_update_user(**user_data)
        return None

    def _get_user_data(self, *args, **kwargs):
        raise NotImplementedError

    def _create_or_update_user(self, **user_data):
        user = User.objects.get_or_create(username=user_data.get('username'))[0]
        user.first_name = user_data.get('first_name')
        user.last_name = user_data.get('last_name')
        user.avatar = user_data.get('avatar')
        user.save()
        return user

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


class VKAuthBackend(CustomAuthBackend):
    def _get_user_data(self, *args, **kwargs):
        try:
            response = requests.get('https://api.vk.com/method/users.get', params={'access_token': kwargs.get('token')})
            if response.status_code == 200 and 'response' in response.json():
                return {'username': 'vk_{}'.format(str(response.json()['response'][0]['uid']))}
        except (IndexError, KeyError, RequestException):
            pass
        return None


class FacebookAuthBackend(CustomAuthBackend):
    def _get_user_data(self, *args, **kwargs):
        try:
            response = requests.get('https://graph.facebook.com/v2.5/me', params={'access_token': kwargs.get('token')})
            if response.status_code == 200 and 'id' in response.json():
                return {'username': 'fb_{}'.format(str(response.json().get('id')))}
        except (IndexError, KeyError, RequestException):
            pass
        return None


class AnonAuthBackend(CustomAuthBackend):
    def _get_user_data(self, *args, **kwargs):
        return {'username': 'anon_{}'.format(str(uuid.uuid4())),
                'first_name': settings.DEFAULT_USER_FIRST_NAME,
                'last_name': settings.DEFAULT_USER_LAST_NAME}
