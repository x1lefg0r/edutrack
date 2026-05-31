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

    if profile.last_activity_date != today:
        if profile.last_activity_date == today - timezone.timedelta(days=1):
            profile.current_streak += 1
        else:
            profile.current_streak = 1
        profile.last_activity_date = today
        profile.max_streak = max(profile.max_streak, profile.current_streak)
        profile.save()
        _check_streak_achievements(instance.user, profile.current_streak)

    if instance.activity_type == UserActivity.ActivityType.COURSE_COMPLETED:
        _check_course_achievements(instance.user)

    if instance.activity_type == UserActivity.ActivityType.OLYMPIAD_REGISTRATION:
        _check_olympiad_achievements(instance.user)


def _check_streak_achievements(user, current_streak: int) -> None:
    achievements = Achievement.objects.filter(
        trigger=Achievement.Trigger.STREAK, threshold=current_streak
    )

    for achievement in achievements:
        UserAchievement.objects.get_or_create(user=user, achievement=achievement)


def _check_olympiad_achievements(user) -> None:
    from olympiads.models import OlympiadRegistration

    count = OlympiadRegistration.objects.filter(user=user).count()
    for achievement in Achievement.objects.filter(
        trigger=Achievement.Trigger.OLYMPIAD, threshold=count
    ):
        UserAchievement.objects.get_or_create(user=user, achievement=achievement)


def _check_course_achievements(user) -> None:
    from courses.models import CourseEnrollment

    completed_count = CourseEnrollment.objects.filter(
        user=user, status=CourseEnrollment.Status.COMPLETED
    ).count()

    for achievement in Achievement.objects.filter(
        trigger=Achievement.Trigger.COURSE, threshold=completed_count
    ):
        UserAchievement.objects.get_or_create(user=user, achievement=achievement)
