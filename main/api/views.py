from rest_framework import viewsets, permissions
from main.models import Game
from serializers import GameSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout


class ResponseMixin(object):

    def get_response(self, status, data=None, message=None):
        status_repr = "true" if status or status != "false" else "false"
        return Response({
            "status": status_repr,
            "data": data if data else "",
            "message": message if message else "",
        })


class GameViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Game.objects.filter(is_shutdown=False, is_published=True)
    serializer_class = GameSerializer
    lookup_field = 'slug'


class Login(APIView, ResponseMixin):

    def post(self, request, *args, **kwargs):
        try:
            token = request.POST['token']
            user = authenticate(token)
            if user:
                login(request, user)
                return self.get_response(True, data=user, message="Auth success")
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
