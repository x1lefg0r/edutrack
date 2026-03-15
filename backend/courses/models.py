# courses/models.py
from django.db import models
from django.utils import timezone
from django.urls import reverse


class Course(models.Model):
    class Format(models.TextChoices):
        SELF_PACED = "self_paced", "Самостоятельный"
        LIVE = "live", "С преподавателем"

    class Level(models.TextChoices):
        BEGINNER = "beginner", "Начинающий"
        INTERMEDIATE = "intermediate", "Средний"
        ADVANCED = "advanced", "Продвинутый"

    title = models.CharField(max_length=200, verbose_name="Название")
    slug = models.SlugField(unique=True, verbose_name="Slug")
    subject = models.ForeignKey(
        "subjects.Subject",
        on_delete=models.PROTECT,
        related_name="courses",
        verbose_name="Предмет",
    )
    olympiad = models.ForeignKey(
        "olympiads.Olympiad",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="preparation_courses",
        verbose_name="Готовит к олимпиаде",
    )
    description = models.TextField(blank=True, verbose_name="Описание")
    format = models.CharField(
        max_length=20,
        choices=Format.choices,
        default=Format.SELF_PACED,
        verbose_name="Формат",
    )
    level = models.CharField(
        max_length=20, choices=Level.choices, verbose_name="Уровень"
    )
    url = models.URLField(verbose_name="Ссылка на курс")
    start_date = models.DateField(null=True, blank=True, verbose_name="Дата начала")
    end_date = models.DateField(null=True, blank=True, verbose_name="Дата окончания")
    is_published = models.BooleanField(default=False, verbose_name="Опубликован")
    created_at = models.DateTimeField(
        default=timezone.now, verbose_name="Дата создания"
    )

    class Meta:
        verbose_name = "Курс"
        verbose_name_plural = "Курсы"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title

    def get_absolute_url(self):
        return reverse("course-detail", kwargs={"slug": self.slug})

    def is_active(self) -> bool:
        """Курс активен если нет end_date или end_date ещё не прошла"""
        if not self.end_date:
            return True
        return self.end_date >= timezone.now().date()


class CourseEnrollment(models.Model):
    class Status(models.TextChoices):
        ENROLLED = "enrolled", "Записан"
        IN_PROGRESS = "in_progress", "В процессе"
        COMPLETED = "completed", "Завершён"
        DROPPED = "dropped", "Брошен"

    user = models.ForeignKey(
        "auth.User",
        on_delete=models.CASCADE,
        related_name="course_enrollments",
        verbose_name="Пользователь",
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrollments",
        verbose_name="Курс",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ENROLLED,
        verbose_name="Статус",
    )
    enrolled_at = models.DateTimeField(default=timezone.now, verbose_name="Дата записи")

    class Meta:
        verbose_name = "Запись на курс"
        verbose_name_plural = "Записи на курсы"
        unique_together = [["user", "course"]]

    def __str__(self) -> str:
        return f"{self.user.username} → {self.course.title}"
