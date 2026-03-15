# olympiads/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from .managers import PublishedManager
from django.urls import reverse

User = get_user_model()


class Olympiad(models.Model):
    class Format(models.TextChoices):
        ONLINE = "online", "Онлайн"
        OFFLINE = "offline", "Офлайн"
        HYBRID = "hybrid", "Гибридный"

    class Level(models.TextChoices):
        SCHOOL = "school", "Школьный"
        REGIONAL = "regional", "Региональный"
        NATIONAL = "national", "Всероссийский"
        INTERNATIONAL = "international", "Международный"

    title = models.CharField(max_length=200, verbose_name="Название")
    slug = models.SlugField(unique=True, verbose_name="Slug")
    subject = models.ForeignKey(
        "subjects.Subject",
        on_delete=models.PROTECT,
        related_name="olympiads",
        verbose_name="Предмет",
    )
    description = models.TextField(blank=True, verbose_name="Описание")
    format = models.CharField(
        max_length=20,
        choices=Format.choices,
        default=Format.ONLINE,
        verbose_name="Формат",
    )
    level = models.CharField(
        max_length=20, choices=Level.choices, verbose_name="Уровень"
    )
    organizer_url = models.URLField(blank=True, verbose_name="Сайт организатора")
    min_grade = models.PositiveSmallIntegerField(
        null=True, blank=True, verbose_name="Минимальный класс"
    )
    max_grade = models.PositiveSmallIntegerField(
        null=True, blank=True, verbose_name="Максимальный класс"
    )
    is_published = models.BooleanField(default=False, verbose_name="Опубликована")
    created_at = models.DateTimeField(
        default=timezone.now, verbose_name="Дата создания"
    )
    objects = models.Manager()
    published = PublishedManager()
    regulations_file = models.FileField(
        upload_to="olympiads/regulations/",
        blank=True,
        null=True,
        verbose_name="Положение об олимпиаде",
    )

    class Meta:
        verbose_name = "Олимпиада"
        verbose_name_plural = "Олимпиады"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title

    def get_absolute_url(self):
        return reverse("olympiad-detail", kwargs={"slug": self.slug})

    def is_registration_open(self) -> bool:
        """Проверяет открыта ли регистрация — есть ли этапы в будущем"""
        return self.stages.filter(start_date__gte=timezone.now()).exists()


class OlympiadStage(models.Model):
    class StageType(models.TextChoices):
        QUALIFYING = "qualifying", "Отборочный"
        SEMIFINAL = "semifinal", "Полуфинал"
        FINAL = "final", "Финал"

    olympiad = models.ForeignKey(
        Olympiad,
        on_delete=models.CASCADE,
        related_name="stages",
        verbose_name="Олимпиада",
    )
    title = models.CharField(max_length=200, verbose_name="Название этапа")
    stage_type = models.CharField(
        max_length=20, choices=StageType.choices, verbose_name="Тип этапа"
    )
    start_date = models.DateTimeField(verbose_name="Дата начала")
    end_date = models.DateTimeField(verbose_name="Дата окончания")
    description = models.TextField(blank=True, verbose_name="Описание")

    class Meta:
        verbose_name = "Этап олимпиады"
        verbose_name_plural = "Этапы олимпиад"
        ordering = ["start_date"]

    def __str__(self) -> str:
        return f"{self.olympiad.title} — {self.title}"


class OlympiadRegistration(models.Model):
    class Status(models.TextChoices):
        REGISTERED = "registered", "Зарегистрирован"
        PARTICIPATED = "participated", "Участвовал"
        WINNER = "winner", "Призёр"
        DISQUALIFIED = "disqualified", "Дисквалифицирован"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="olympiad_registrations",
        verbose_name="Пользователь",
    )
    olympiad = models.ForeignKey(
        Olympiad,
        on_delete=models.CASCADE,
        related_name="registrations",
        verbose_name="Олимпиада",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.REGISTERED,
        verbose_name="Статус",
    )
    registered_at = models.DateTimeField(
        default=timezone.now, verbose_name="Дата регистрации"
    )
    result_score = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Результат"
    )

    class Meta:
        verbose_name = "Регистрация на олимпиаду"
        verbose_name_plural = "Регистрации на олимпиады"
        unique_together = [["user", "olympiad"]]

    def __str__(self) -> str:
        return f"{self.user.username} → {self.olympiad.title}"
