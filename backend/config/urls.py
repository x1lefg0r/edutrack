"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from subjects.views import SubjectViewSet
from olympiads.views import OlympiadViewSet, olympiad_redirect_view, HomepageView
from courses.views import CourseViewSet
from users.views import (
    RegisterView,
    MeView,
    MyRegistrationsView,
    MyEnrollmentsView,
    MyAchievementsView,
    LeaderboardView,
)
from gamification.views import ActivityHeatmapView
from django.conf import settings
from debug_toolbar.toolbar import debug_toolbar_urls


router = DefaultRouter()
router.register("subjects", SubjectViewSet, basename="subject")
router.register("olympiads", OlympiadViewSet, basename="olympiad")
router.register("courses", CourseViewSet, basename="course")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("silk/", include("silk.urls", namespace="silk")),
    path("api/auth/register/", RegisterView.as_view()),
    path("api/auth/token/", TokenObtainPairView.as_view()),
    path("api/auth/token/refresh/", TokenRefreshView.as_view()),
    path("api/profile/me/", MeView.as_view()),
    path("api/profile/me/registrations/", MyRegistrationsView.as_view()),
    path("api/profile/me/enrollments/", MyEnrollmentsView.as_view()),
    path("api/profile/me/achievements/", MyAchievementsView.as_view()),
    path("api/leaderboard/", LeaderboardView.as_view()),
    path("api/gamification/activity/", ActivityHeatmapView.as_view()),
    path("o/<slug:slug>/", olympiad_redirect_view, name="olympiad-redirect"),
    path("api/homepage/", HomepageView.as_view()),
    path("api-auth/", include("rest_framework.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
if settings.DEBUG:
    urlpatterns += debug_toolbar_urls()
