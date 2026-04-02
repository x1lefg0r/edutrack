from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import UserActivity, Achievement, UserAchievement
from users.models import Profile


@receiver(post_save, sender=UserActivity)
def handle_activity(sender, instance, created, **kwargs):
    if not created:
        return

    profile, _ = Profile.objects.get_or_create(user=instance.user)
    today = timezone.now().date()

    if profile.last_activity_date == today:
        return

    if profile.last_activity_date == today - timezone.timedelta(days=1):
        profile.current_streak += 1
    else:
        profile.current_streak = 1

    profile.last_activity_date = today
    profile.max_streak = max(profile.max_streak, profile.current_streak)
    profile.save()

    _check_streak_achievements(instance.user, profile.current_streak)


def _check_streak_achievements(user, current_streak: int) -> None:
    achievements = Achievement.objects.filter(
        trigger=Achievement.Trigger.STREAK, threshold=current_streak
    )

    for achievement in achievements:
        UserAchievement.objects.get_or_create(user=user, achievement=achievement)
