# courses/views.py
from django.db.models import Count
from rest_framework import viewsets, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from gamification.models import UserActivity
from .models import Course, CourseEnrollment
from .serializers import CourseSerializer, CourseEnrollmentSerializer
from config.permissions import IsCourseCreator


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = PageNumberPagination
    lookup_field = "slug"
    ordering_fields = {
        "created_at",
        "-created_at",
        "title",
        "-title",
        "start_date",
        "-start_date",
    }

    def get_queryset(self):
        qs = Course.objects.select_related("subject", "olympiad").annotate(
            enrollments_count=Count("enrollments")
        )

        if not (
            self.request.user.is_authenticated
            and self.request.user.is_staff
            and self.action not in ["enroll"]
        ):
            qs = qs.filter(is_published=True)

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
            qs = qs.filter(format=format_)
        if search:
            qs = qs.filter(title__icontains=search)

        if ordering not in self.ordering_fields:
            ordering = "-created_at"

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

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsCourseCreator()]
        if self.action in ["enroll", "complete"]:
            return [IsAuthenticated()]
        return [IsAuthenticatedOrReadOnly()]

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def complete(self, request, slug=None):
        course = self.get_object()
        enrollment = CourseEnrollment.objects.filter(
            user=request.user, course=course
        ).first()

        if not enrollment:
            return Response({"detail": "Вы не записаны на этот курс."}, status=404)
        if enrollment.status == CourseEnrollment.Status.COMPLETED:
            return Response({"detail": "Курс уже завершён."}, status=400)

        enrollment.status = CourseEnrollment.Status.COMPLETED
        enrollment.save()

        UserActivity.objects.create(
            user=request.user,
            activity_type=UserActivity.ActivityType.COURSE_COMPLETED,
        )
        return Response(CourseEnrollmentSerializer(enrollment).data)
