# coding: utf-8

from rest_framework import viewsets
from main.models import User, Game, HiScore
from serializers import UserSerializer, GameSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from lentach_games import settings


class ResponseMixin(object):
    def get_response(self, status, data=None, message=None):
        return Response({
            "status": status,
            "data": data if data else None,
            "message": message if message else None,
        })


class GameViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Game.objects.filter(is_shutdown=False, is_published=True)
    serializer_class = GameSerializer
    lookup_field = 'slug'


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(is_superuser=False, is_staff=False)
    serializer_class = UserSerializer
    lookup_field = 'username'


class GetHiScoreTop(APIView, ResponseMixin):
    def get(self, request, *args, **kwargs):
        try:
            game = Game.objects.get(slug=request.query_params.dict().get('game'))
            number_of_gamers = int(request.query_params.dict().get('number'))

        except Game.DoesNotExist:
            return self.get_response(False, message="Game does not exist")
        except (ValueError, TypeError):
            return self.get_response(False, message="Number is incorrect")
        if number_of_gamers <= 0:
            number_of_gamers = settings.DEFAULT_HI_SCORE_TOP_SIZE
        hi_score_list = []
        num = 1
        for hi_score in HiScore.objects.filter(game=game,
                                               user__is_superuser=False,
                                               user__is_staff=False).order_by('-value')[0: number_of_gamers]:
            hi_score_list.append({'number': num, 'user': UserSerializer(hi_score.user).data,
                                  'value': hi_score.value, 'is_self': hi_score.user == request.user })
            num += 1
        return self.get_response(True, data=hi_score_list)


class SetHiScore(APIView, ResponseMixin):
    def post(self, request, *args, **kwargs):
        try:
            score = int(request.data.dict().get('score'))
            game = Game.objects.get(slug=request.data.dict().get('game'))
        except Game.DoesNotExist:
            return self.get_response(False, message='Game {} does not exist'.format(request.data.dict().get('game')))
        except (ValueError, TypeError):
            return self.get_response(False, 'Score value {} is incorrect'.format(request.data.dict().get('score')))
        score_data = {'is_hi_score': False, 'new_score': score, 'old_score': None}
        if game and score and request.user.is_authenticated():
            try:
                hi_score = HiScore.objects.get(user=request.user, game=game)
                score_data['old_score'] = hi_score.value
                if score > hi_score.value:
                    hi_score.value = score
                    score_data['is_hi_score'] = True
                    hi_score.save()
            except HiScore.DoesNotExist:
                hi_score = HiScore(user=request.user, game=game, value=score)
                hi_score.save()
            return self.get_response(True, data=score_data, message='HiScore updated')
        return self.get_response(False, message='HiScore not updated')


class CheckAuthentication(APIView, ResponseMixin):
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated():
            user_data = UserSerializer(request.user).data
            return self.get_response(True, data=user_data)
        else:
            return self.get_response(False)


class Login(APIView, ResponseMixin):

    def post(self, request, *args, **kwargs):
        try:
            user = authenticate(**request.data.dict())
            if user:
                login(request, user)
                user_data = UserSerializer(user).data
                return self.get_response(True, data=user_data, message="Login successful")
            return self.get_response(False, message="Auth failed: No such user or auth backend")

        except KeyError as e:
            return self.get_response(False, message="Auth failed: {}".format(e))


class Logout(APIView, ResponseMixin):
    def get(self, request):
        return self._logout(request)

    def post(self, request):
        return self._logout(request)

    def _logout(self, request):
        logout(request)
        return self.get_response(True, "Logged out")
