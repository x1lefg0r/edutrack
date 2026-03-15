from django.contrib import admin
from .models import Subject


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "olympiads_count", "courses_count"]
    list_display_links = ["name", "slug"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ("name",)}

    @admin.display(description="Олимпиад")
    def olympiads_count(self, obj):
        return obj.olympiads.count()

    @admin.display(description="Курсов")
    def courses_count(self, obj):
        return obj.courses.count()
