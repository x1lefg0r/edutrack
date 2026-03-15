from django.contrib import admin
from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "current_streak",
        "max_streak",
        "last_activity_date",
        "achievements_count",
    ]
    list_display_links = ["user"]
    search_fields = ["user__username", "user__email"]
    readonly_fields = [
        "current_streak",
        "max_streak",
        "last_activity_date",
        "created_at",
    ]
    raw_id_fields = ["user"]
    filter_horizontal = ["subjects"]

    @admin.display(description="Достижений")
    def achievements_count(self, obj):
        return obj.user.achievements.count()
