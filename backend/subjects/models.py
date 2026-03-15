# subjects/models.py
from django.db import models


class Subject(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название")
    slug = models.SlugField(unique=True, verbose_name="Slug")
    description = models.TextField(blank=True, verbose_name="Описание")
    icon = models.ImageField(
        upload_to="subjects/icons/", blank=True, null=True, verbose_name="Иконка"
    )

    class Meta:
        verbose_name = "Предмет"
        verbose_name_plural = "Предметы"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
