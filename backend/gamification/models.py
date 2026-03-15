# gamification/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Achievement(models.Model):
    class Trigger(models.TextChoices):
        STREAK = "streak", "Стрик"
        OLYMPIAD = "olympiad", "Олимпиада"
        COURSE = "course", "Курс"

    title = models.CharField(max_length=200, verbose_name="Название")
    description = models.TextField(verbose_name="Описание")
    icon = models.ImageField(
        upload_to="achievements/icons/", blank=True, null=True, verbose_name="Иконка"
    )
    trigger = models.CharField(
        max_length=20, choices=Trigger.choices, verbose_name="Триггер"
    )
    threshold = models.PositiveIntegerField(
        verbose_name="Порог", help_text="Например, 7 для стрика в 7 дней"
    )

    class Meta:
        verbose_name = "Достижение"
        verbose_name_plural = "Достижения"

    def __str__(self) -> str:
        return self.title


class UserAchievement(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="achievements",
        verbose_name="Пользователь",
    )
    achievement = models.ForeignKey(
        Achievement,
        on_delete=models.CASCADE,
        related_name="user_achievements",
        verbose_name="Достижение",
    )
    unlocked_at = models.DateTimeField(
        default=timezone.now, verbose_name="Дата получения"
    )

    class Meta:
        verbose_name = "Достижение пользователя"
        verbose_name_plural = "Достижения пользователей"
        unique_together = [["user", "achievement"]]

    def __str__(self) -> str:
        return f"{self.user.username} — {self.achievement.title}"


class UserActivity(models.Model):
    class ActivityType(models.TextChoices):
        OLYMPIAD_REGISTRATION = "olympiad_registration", "Регистрация на олимпиаду"
        COURSE_ENROLLMENT = "course_enrollment", "Запись на курс"
        COURSE_COMPLETED = "course_completed", "Курс завершён"
        PROFILE_UPDATE = "profile_update", "Обновление профиля"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="activities",
        verbose_name="Пользователь",
    )
    activity_type = models.CharField(
        max_length=30, choices=ActivityType.choices, verbose_name="Тип активности"
    )
    created_at = models.DateTimeField(
        default=timezone.now, verbose_name="Дата активности"
    )

    class Meta:
        verbose_name = "Активность пользователя"
        verbose_name_plural = "Активности пользователей"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user.username} — {self.activity_type} — {self.created_at.date()}"
