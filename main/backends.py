from models import User
import requests

class CustomSocialAuthBackend(object):

    def authenticate(self, token):
        user_data = self._get_user_data(token)
        if not user_data:
            return None
        try:
            user = User.objects.get(username='{}{}'.format(user_data.get('social'), user_data.get('uid')))
            user.avatar = user_data.get('avatar')
            user.save()
            return user
        except User.DoesNotExist:
            return self._create_new_user(**user_data)

    def _get_user_data(self, token):
        raise NotImplementedError

    def _create_new_user(self, **user_data):
        user = User.objects.create_user(
            '{}{}'.format(user_data.get('social'), user_data.get('uid')),
            password='111',
        )
        user.set_unusable_password()
        user.social = user_data.get('social')
        user.avatar = user_data.get('avatar')
        user.save()
        return user

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


class VKAuthBackend(CustomSocialAuthBackend):
    def _get_user_data(self, token):
        response = requests.get('https://api.vk.com/method/users.get', params={'access_token': token})
        if response.status_code == 200 and 'response' in response.json():
            return {'uid': str(response.json()['response'][0]['uid']), 'social': 'vk'}
        return None


class FacebookAuthBackend(CustomSocialAuthBackend):
    def _get_user_data(self, token):
        response = requests.get('https://www.googleapis.com/oauth2/v3/tokeninfo', params={'id_token': token})
        if response.status_code == 200 and 'sub' in response.json():
            return {'uid': str(response.json()['sub']), 'social': 'fb'}
        return None
