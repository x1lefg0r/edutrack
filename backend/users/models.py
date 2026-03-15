# users/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
        verbose_name="Пользователь",
    )
    avatar = models.ImageField(
        upload_to="avatars/%Y/%m/", blank=True, null=True, verbose_name="Аватар"
    )
    bio = models.TextField(blank=True, verbose_name="О себе")
    subjects = models.ManyToManyField(
        "subjects.Subject",
        blank=True,
        related_name="interested_users",
        verbose_name="Интересующие предметы",
    )
    current_streak = models.PositiveIntegerField(
        default=0, verbose_name="Текущий стрик"
    )
    max_streak = models.PositiveIntegerField(
        default=0, verbose_name="Максимальный стрик"
    )
    last_activity_date = models.DateField(
        null=True, blank=True, verbose_name="Дата последней активности"
    )
    created_at = models.DateTimeField(
        default=timezone.now, verbose_name="Дата регистрации"
    )

    class Meta:
        verbose_name = "Профиль"
        verbose_name_plural = "Профили"

    def __str__(self) -> str:
        return f"Профиль {self.user.username}"
