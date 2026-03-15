# courses/views.py
from django.db.models import Count
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from gamification.models import UserActivity
from .models import Course, CourseEnrollment
from .serializers import CourseSerializer, CourseEnrollmentSerializer


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        qs = (
            Course.objects.filter(is_published=True)
            .select_related("subject", "olympiad")
            .annotate(enrollments_count=Count("enrollments"))  # annotate пример 2
        )

        subject = self.request.query_params.get("subject")
        level = self.request.query_params.get("level")
        format_ = self.request.query_params.get("format")
        search = self.request.query_params.get("search")
        ordering = self.request.query_params.get("ordering", "-created_at")

        if subject:
            qs = qs.filter(subject__slug=subject)
        if level:
            qs = qs.filter(level=level)
        if format_:
            qs = qs.exclude(format=format_)
        if search:
            qs = qs.filter(title__icontains=search)

        return qs.order_by(ordering)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def enroll(self, request, slug=None):
        course = self.get_object()
        enrollment, created = CourseEnrollment.objects.get_or_create(
            user=request.user,
            course=course,
        )
        if not created:
            return Response(
                {"detail": "Вы уже записаны на этот курс."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        UserActivity.objects.create(
            user=request.user, activity_type=UserActivity.ActivityType.COURSE_ENROLLMENT
        )
        return Response(
            CourseEnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED
        )
