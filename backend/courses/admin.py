from django.contrib import admin
from .models import Course, CourseEnrollment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "subject",
        "format",
        "level",
        "is_published",
        "enrollments_count",
        "created_at",
    ]
    list_display_links = ["title", "subject"]
    list_filter = ["format", "level", "is_published", "subject"]
    search_fields = ["title", "subject__name"]
    prepopulated_fields = {"slug": ("title",)}
    raw_id_fields = ["subject", "olympiad"]
    date_hierarchy = "created_at"
    readonly_fields = ["created_at"]

    @admin.display(description="Записей")
    def enrollments_count(self, obj):
        return obj.enrollments.count()


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ["user", "course", "status", "enrolled_at"]
    list_display_links = ["user", "course"]
    list_filter = ["status", "course__subject"]
    search_fields = ["user__username", "course__title"]
    raw_id_fields = ["user", "course"]
    readonly_fields = ["enrolled_at"]
