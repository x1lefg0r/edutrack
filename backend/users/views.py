# users/views.py — добавь новый endpoint
from django.db.models import Count
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Profile
from .serializers import RegisterSerializer, ProfileSerializer
from olympiads.serializers import OlympiadRegistrationSerializer
from courses.serializers import CourseEnrollmentSerializer
from gamification.serializers import UserAchievementSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile


class MyRegistrationsView(generics.ListAPIView):
    serializer_class = OlympiadRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.olympiad_registrations.select_related(
            "olympiad__subject"
        ).order_by("-registered_at")


class MyEnrollmentsView(generics.ListAPIView):
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.course_enrollments.select_related(
            "course__subject"
        ).order_by("-enrolled_at")


class MyAchievementsView(generics.ListAPIView):
    serializer_class = UserAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.achievements.select_related("achievement").order_by(
            "-unlocked_at"
        )


class LeaderboardView(generics.ListAPIView):
    """
    Аннотация пример 3 — топ пользователей по количеству достижений
    Используем related_name='achievements' который мы задали в UserAchievement
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        profiles = (
            Profile.objects.select_related("user")
            .annotate(achievements_count=Count("user__achievements"))
            .order_by("-achievements_count")[:10]
        )
        data = [
            {
                "username": p.user.username,
                "achievements_count": p.achievements_count,
                "current_streak": p.current_streak,
                "max_streak": p.max_streak,
            }
            for p in profiles
        ]
        return Response(data)
