# coding: utf-8
from django.db.models import Q
from django.contrib.auth import authenticate, login, logout
from main.models import User, Game, HiScore, SiteConfiguration
from serializers import UserSerializer, GameSerializer
from rest_framework import views, viewsets, response, permissions
from rest_framework.authtoken.models import Token

from lentach_games import settings


class ResponseMixin(object):
    def get_response(self, status, data=None, message=None):
        return response.Response({
            "status": status,
            "data": data if data else None,
            "message": message if message else None,
        })


class GameListsMixin(object):
    def _get_game_list(self, exclude_game=None, is_published=True, is_shutdown=False):
        pk = exclude_game.pk if exclude_game else None
        return Game.objects.filter(~Q(pk=pk),
                                   is_published=is_published,
                                   is_shutdown=is_shutdown).order_by('-created_at')


class Index(views.APIView, ResponseMixin, GameListsMixin):
    def get(self, request, *args, **kwargs):
        config = SiteConfiguration.get_solo()
        game_list = self._get_game_list(exclude_game=config.current_game)
        return self.get_response(
            True,
            data={'current_game': GameSerializer(config.current_game).data if config.current_game else None,
                  'other_games': GameSerializer(game_list, many=True).data, })


class GameViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Game.objects.filter(is_shutdown=False, is_published=True)
    serializer_class = GameSerializer
    lookup_field = 'slug'


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(is_superuser=False, is_staff=False)
    serializer_class = UserSerializer
    lookup_field = 'username'


class GetHiScoreTop(views.APIView, ResponseMixin):
    def get(self, request, *args, **kwargs):
        try:
            game = Game.objects.get(slug=request.query_params.dict().get('game'))
        except Game.DoesNotExist:
            return self.get_response(False, message="Game does not exist")
        number_of_gamers = settings.DEFAULT_HI_SCORE_TOP_SIZE
        hi_score_list = []
        num = 1
        for hi_score in HiScore.objects.filter(game=game,
                                               user__is_staff=False).order_by('-value')[0: number_of_gamers]:
            hi_score_list.append({'number': num, 'user': UserSerializer(hi_score.user).data,
                                  'value': hi_score.value, 'is_self': hi_score.user == request.user })
            num += 1
        return self.get_response(True, data=hi_score_list)


class SetHiScore(views.APIView, ResponseMixin):
    def post(self, request, *args, **kwargs):
        try:
            score = int(request.data.dict().get('score'))
            game = Game.objects.get(slug=request.data.dict().get('game'))
        except Game.DoesNotExist:
            return self.get_response(False, message='Game {} does not exist'.format(request.data.dict().get('game')))
        except (ValueError, TypeError):
            return self.get_response(False, 'Score value {} is incorrect'.format(request.data.dict().get('score')))
        hi_score = HiScore.objects.get_or_create(user=request.user, game=game)[0]
        score_data = {'new_score': score, 'old_score': hi_score.value, 'is_hi_score': score > hi_score.value}
        hi_score.value = score if score > hi_score.value else hi_score.value
        hi_score.save()
        return self.get_response(True, data=score_data)


class CheckAuthentication(views.APIView, ResponseMixin):
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated():
            user_data = UserSerializer(request.user).data
            user_data.update(token=Token.objects.get_or_create(user=request.user)[0].key)
            return self.get_response(True, data=user_data)
        else:
            return self.get_response(False)


class Login(views.APIView, ResponseMixin):
    permission_classes = (permissions.AllowAny, )

    def post(self, request, *args, **kwargs):
        try:
            user = authenticate(**request.data.dict())
            if user:
                login(request, user)
                user_data = UserSerializer(user).data
                user_data.update(token=Token.objects.get_or_create(user=user)[0].key)
                if getattr(user, '_created', False):
                    user_data.update(created=True)
                return self.get_response(True, data=user_data, message="Login successful")
            return self.get_response(False, message="Auth failed: No such user or auth backend")

        except KeyError as e:
            return self.get_response(False, message="Auth failed: {}".format(e))


class Logout(views.APIView, ResponseMixin):
    def get(self, request):
        return self._logout(request)

    def post(self, request):
        return self._logout(request)

    def _logout(self, request):
        logout(request)
        return self.get_response(True, "Logged out")
