from models import User


class CustomSocialAuthBackend(object):

    def authenticate(self, token):
        user_data = self._get_user_data(token)
        if not user_data:
            return None
        try:
            user = User.objects.get(username=user_data.get('username'))
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
        user.save()
        return user

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


