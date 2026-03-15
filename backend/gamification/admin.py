# gamification/admin.py
from django.contrib import admin
from .models import Achievement, UserAchievement, UserActivity


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ["title", "trigger", "threshold", "unlocked_count"]
    list_display_links = ["title"]
    list_filter = ["trigger"]
    search_fields = ["title"]

    @admin.display(description="Выдано раз")
    def unlocked_count(self, obj):
        return obj.user_achievements.count()


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ["user", "achievement", "unlocked_at"]
    list_display_links = ["user", "achievement"]
    list_filter = ["achievement__trigger"]
    search_fields = ["user__username", "achievement__title"]
    raw_id_fields = ["user", "achievement"]
    readonly_fields = ["unlocked_at"]


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ["user", "activity_type", "created_at"]
    list_display_links = ["user"]
    list_filter = ["activity_type"]
    search_fields = ["user__username"]
    raw_id_fields = ["user"]
    date_hierarchy = "created_at"
    readonly_fields = ["created_at"]
