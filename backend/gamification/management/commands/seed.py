from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from slugify import slugify
from faker import Faker
from datetime import timedelta
import random

from subjects.models import Subject
from olympiads.models import Olympiad, OlympiadStage, OlympiadRegistration
from courses.models import Course, CourseEnrollment
from users.models import Profile
from gamification.models import Achievement, UserAchievement, UserActivity

User = get_user_model()
fake = Faker("ru_RU")


class Command(BaseCommand):
    help = "Seed database with fake data"

    def handle(self, *args, **kwargs):
        self._seed_subjects()
        self._seed_olympiads()
        self._seed_courses()
        self._seed_achievements()
        self._seed_users()
        self._seed_registrations()
        self._seed_activities()
        self.stdout.write(self.style.SUCCESS("Done!"))

    def _seed_subjects(self):
        subjects = ["Математика", "Информатика", "Физика", "Химия", "Биология"]
        for name in subjects:
            Subject.objects.get_or_create(slug=slugify(name), defaults={"name": name})
        self.stdout.write("Subjects seeded")

    def _seed_olympiads(self):
        subjects = list(Subject.objects.all())

        for _ in range(15):
            title = fake.catch_phrase()

            olympiad, created = Olympiad.objects.get_or_create(
                slug=slugify(title)[:50],
                defaults={
                    "title": title,
                    "subject": random.choice(subjects),
                    "level": random.choice(Olympiad.Level.values),
                    "format": random.choice(Olympiad.Format.values),
                    "description": fake.text(),
                    "organizer_url": fake.url(),
                    "is_published": True,
                },
            )

            if created:
                for stage_type in OlympiadStage.StageType.values:
                    start = fake.future_datetime(tzinfo=timezone.utc)
                    end = start + timedelta(days=random.randint(1, 10))

                    OlympiadStage.objects.create(
                        olympiad=olympiad,
                        title=f"{olympiad.get_level_display()} — {stage_type}",
                        stage_type=stage_type,
                        start_date=start,
                        end_date=end,
                        description=fake.text(),
                    )

        self.stdout.write("Olympiads seeded")

    def _seed_courses(self):
        subjects = list(Subject.objects.all())
        olympiads = list(Olympiad.objects.all())

        for _ in range(15):
            title = fake.catch_phrase()

            start = fake.future_date()
            end = start + timedelta(days=random.randint(10, 60))

            Course.objects.get_or_create(
                slug=slugify(title)[:50],
                defaults={
                    "title": title,
                    "subject": random.choice(subjects),
                    "olympiad": random.choice([None, None, random.choice(olympiads)]),
                    "level": random.choice(Course.Level.values),
                    "format": random.choice(Course.Format.values),
                    "description": fake.text(),
                    "url": fake.url(),
                    "start_date": start,
                    "end_date": end,
                    "is_published": True,
                },
            )

        self.stdout.write("Courses seeded")

    def _seed_achievements(self):
        achievements = [
            ("Первые шаги", Achievement.Trigger.STREAK, 3, "3 дня подряд"),
            ("Недельный марафон", Achievement.Trigger.STREAK, 7, "7 дней подряд"),
            ("Марафонец", Achievement.Trigger.STREAK, 14, "14 дней подряд"),
            ("Месяц без пропусков", Achievement.Trigger.STREAK, 30, "30 дней подряд"),
            ("Первая олимпиада", Achievement.Trigger.OLYMPIAD, 1, "1 олимпиада"),
            ("Начало пути", Achievement.Trigger.OLYMPIAD, 2, "2 олимпиады"),
            ("Коллекционер", Achievement.Trigger.OLYMPIAD, 5, "5 олимпиад"),
            ("Первый курс", Achievement.Trigger.COURSE, 1, "1 курс"),
            ("Студент", Achievement.Trigger.COURSE, 3, "3 курса"),
            ("Продвинутый", Achievement.Trigger.COURSE, 5, "5 курсов"),
            ("Завис на платформе", Achievement.Trigger.COURSE, 10, "10 курсов"),
        ]

        for title, trigger, threshold, description in achievements:
            Achievement.objects.get_or_create(
                title=title,
                defaults={
                    "trigger": trigger,
                    "threshold": threshold,
                    "description": description,
                },
            )

        self.stdout.write("Achievements seeded")

    def _seed_users(self):
        subjects = list(Subject.objects.all())

        creator, created = User.objects.get_or_create(
            username="x1lefg0r",
            defaults={
                "email": "x1lefg0r@gmail.com",
                "first_name": "Егор",
                "last_name": "Балынин",
                "is_staff": True,
            },
        )

        if created:
            creator.set_password("eg0rka6002006")
            creator.save()
            Profile.objects.get_or_create(user=creator)

        for _ in range(15):
            username = fake.user_name()

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": fake.email(),
                    "first_name": fake.first_name(),
                    "last_name": fake.last_name(),
                },
            )

            if created:
                user.set_password("qwerty123")
                user.save()

                profile = Profile.objects.create(user=user)
                profile.subjects.set(random.sample(subjects, k=min(2, len(subjects))))

        self.stdout.write("Users seeded")

    def _seed_registrations(self):
        users = list(User.objects.filter(is_superuser=False, is_staff=False))
        olympiads = list(Olympiad.objects.all())
        courses = list(Course.objects.all())

        for user in users:
            for olympiad in random.sample(olympiads, k=min(3, len(olympiads))):
                OlympiadRegistration.objects.get_or_create(
                    user=user,
                    olympiad=olympiad,
                    defaults={
                        "status": random.choice(OlympiadRegistration.Status.values)
                    },
                )

            for course in random.sample(courses, k=min(3, len(courses))):
                CourseEnrollment.objects.get_or_create(
                    user=user,
                    course=course,
                    defaults={"status": random.choice(CourseEnrollment.Status.values)},
                )

        self.stdout.write("Registrations seeded")

    def _seed_activities(self):
        users = list(User.objects.filter(is_superuser=False, is_staff=False))
        activity_types = UserActivity.ActivityType.values

        for user in users:
            behavior = random.choice(["lazy", "active", "hardcore"])

            if behavior == "lazy":
                days_count = random.randint(5, 15)
            elif behavior == "active":
                days_count = random.randint(20, 40)
            else:
                days_count = random.randint(45, 60)

            active_days = sorted(random.sample(range(60), days_count))

            for day_offset in active_days:
                activity_date = timezone.now() - timedelta(days=day_offset)

                for _ in range(random.randint(1, 3)):
                    UserActivity.objects.get_or_create(
                        user=user,
                        activity_type=random.choice(activity_types),
                        created_at=activity_date,
                    )

            profile = Profile.objects.get(user=user)

            streak = self._calculate_streak(active_days)

            profile.current_streak = streak
            profile.max_streak = max(streak, random.randint(streak, streak + 10))
            profile.last_activity_date = (
                (timezone.now() - timedelta(days=active_days[0])).date()
                if active_days
                else None
            )
            profile.save()

            self._assign_achievements(user)

        self.stdout.write("Activities seeded")

    def _calculate_streak(self, active_days):
        if not active_days:
            return 0

        active_days = sorted(active_days)

        # если пользователь не активен последние 2 дня — стрик = 0
        if active_days[0] > 1:
            return 0

        streak = 1

        for i in range(1, len(active_days)):
            if active_days[i] - active_days[i - 1] == 1:
                streak += 1
            else:
                break

        return streak

    def _assign_achievements(self, user):
        profile = Profile.objects.get(user=user)

        stats = {
            Achievement.Trigger.STREAK: profile.current_streak,
            Achievement.Trigger.OLYMPIAD: OlympiadRegistration.objects.filter(
                user=user
            ).count(),
            Achievement.Trigger.COURSE: CourseEnrollment.objects.filter(
                user=user
            ).count(),
        }

        for achievement in Achievement.objects.all():
            value = stats.get(achievement.trigger)

            if value is not None and value >= achievement.threshold:
                UserAchievement.objects.get_or_create(
                    user=user,
                    achievement=achievement,
                )
