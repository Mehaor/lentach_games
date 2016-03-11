from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter

from main.api import views
router = DefaultRouter()
router.register('games', views.GameViewSet)
router.register('users', views.UserViewSet)

urlpatterns = [
    url('^index/', views.Index.as_view()),
    url('^login/', views.Login.as_view()),
    url('^logout/', views.Logout.as_view()),
    url('^check_auth/', views.CheckAuthentication.as_view()),

    url('^hi_scores/', views.GetHiScoreTop.as_view()),

    url(r'', include(router.urls)),
]
