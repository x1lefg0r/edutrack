from django.db.models import Count, Avg, Min
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import (
    IsAuthenticatedOrReadOnly,
    IsAuthenticated,
    IsAdminUser,
)
from rest_framework.response import Response
from gamification.models import UserActivity
from .models import Olympiad, OlympiadRegistration
from .serializers import OlympiadSerializer, OlympiadRegistrationSerializer
from django.shortcuts import get_object_or_404, redirect as django_redirect
from django.http import HttpRequest, HttpResponse, Http404
from rest_framework.views import APIView
from django.utils import timezone
from subjects.models import Subject
from subjects.serializers import SubjectSerializer
from courses.models import Course
from courses.serializers import CourseSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from config.permissions import IsCourseCreator


@method_decorator(cache_page(60 * 5), name="list")
class OlympiadViewSet(viewsets.ModelViewSet):
    serializer_class = OlympiadSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "slug"
    ordering_fields = {
        "created_at",
        "-created_at",
        "title",
        "-title",
        "next_stage_date",
        "-next_stage_date",
    }

    def get_queryset(self):
        qs = (
            Olympiad.objects.all()
            .select_related("subject")
            .prefetch_related("stages")
            .annotate(
                participants_count=Count("registrations"),
                next_stage_date=Min("stages__start_date"),
            )
        )

        if not (
            self.request.user.is_authenticated
            and self.request.user.is_staff
            and self.action not in ["register", "unregister"]
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

    def get_permissions(self):
        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
            "unpublish",
        ]:
            return [IsCourseCreator()]
        if self.action in ["titles", "stats"]:
            return [IsAdminUser()]
        if self.action in ["register", "unregister"]:
            return [IsAuthenticated()]
        return [IsAuthenticatedOrReadOnly()]

    def retrieve(self, request, *args, **kwargs):
        """
        Http404 — если олимпиада не найдена или не опубликована
        """
        slug = kwargs.get("slug")
        if not self.get_queryset().filter(slug=slug).exists():
            raise Http404("Олимпиада не найдена")
        return super().retrieve(request, *args, **kwargs)

    @action(detail=False, methods=["get"])
    def subjects_list(self, request):
        """
        values() — возвращает QuerySet словарей вместо объектов модели.
        Используем когда нужны только конкретные поля — быстрее чем
        загружать полные объекты
        """
        data = (
            Olympiad.published.all().values("subject__name", "subject__slug").distinct()
        )
        return Response(data)

    @action(detail=False, methods=["get"], permission_classes=[IsAdminUser])
    def titles(self, request):
        """
        values_list() — возвращает QuerySet кортежей.
        flat=True когда одно поле — просто список значений
        """
        titles = Olympiad.objects.values_list("title", flat=True)
        return Response(list(titles))

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUser])
    def unpublish(self, request, slug=None):
        """
        update() — обновляет записи на уровне SQL без загрузки объектов.
        Эффективнее чем obj.save() когда нужно обновить много записей
        """
        olympiad = self.get_object()
        Olympiad.objects.filter(pk=olympiad.pk).update(is_published=False)
        return Response({"detail": "Олимпиада снята с публикации."})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def register(self, request, slug=None):
        olympiad = self.get_object()
        registration, created = OlympiadRegistration.objects.get_or_create(
            user=request.user,
            olympiad=olympiad,
        )
        if not created:
            return Response(
                {"detail": "Вы уже зарегистрированы на эту олимпиаду."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        UserActivity.objects.create(
            user=request.user,
            activity_type=UserActivity.ActivityType.OLYMPIAD_REGISTRATION,
        )
        return Response(
            OlympiadRegistrationSerializer(registration).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["delete"], permission_classes=[IsAuthenticated])
    def unregister(self, request, slug=None):
        """
        delete() — удаляет записи на уровне SQL
        __contains — регистрозависимый поиск (в отличие от icontains)
        """
        olympiad = self.get_object()
        deleted_count, _ = OlympiadRegistration.objects.filter(
            user=request.user,
            olympiad=olympiad,
            olympiad__title__contains="",
        ).delete()

        if not deleted_count:
            return Response(
                {"detail": "Регистрация не найдена."}, status=status.HTTP_404_NOT_FOUND
            )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get"], permission_classes=[IsAdminUser])
    def stats(self, request, slug=None):
        olympiad = self.get_object()
        data = OlympiadRegistration.objects.filter(olympiad=olympiad).aggregate(
            total_participants=Count("id"),
            avg_score=Avg("result_score"),
        )
        return Response(data)


def olympiad_redirect_view(request: HttpRequest, slug: str) -> HttpResponse:
    """
    Демонстрация redirect — если олимпиада не найдена редиректим на список.
    Также используется как короткая ссылка /o/<slug>/ → /api/olympiads/<slug>/
    """
    olympiad = get_object_or_404(Olympiad, slug=slug, is_published=True)
    return django_redirect(olympiad.get_absolute_url())


class HomepageView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        upcoming_olympiads = (
            Olympiad.published.all()
            .filter(stages__start_date__gte=timezone.now())
            .select_related("subject")
            .prefetch_related("stages")
            .annotate(
                participants_count=Count("registrations", distinct=True),
                next_stage_date=Min("stages__start_date"),
            )
            .order_by("next_stage_date")[:5]
        )

        popular_courses = (
            Course.objects.filter(is_published=True)
            .exclude(enrollments=None)  # exclude()
            .select_related("subject")
            .annotate(enrollments_count=Count("enrollments", distinct=True))
            .order_by("-enrollments_count")[:5]
        )

        subjects = Subject.objects.filter(olympiads__is_published=True).distinct().all()

        return Response(
            {
                "upcoming_olympiads": OlympiadSerializer(
                    upcoming_olympiads, many=True
                ).data,
                "popular_courses": CourseSerializer(popular_courses, many=True).data,
                "subjects": SubjectSerializer(subjects, many=True).data,
            }
        )
