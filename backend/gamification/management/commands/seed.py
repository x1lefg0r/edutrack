from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from slugify import slugify
from faker import Faker
from subjects.models import Subject
from olympiads.models import Olympiad, OlympiadStage
from courses.models import Course
from users.models import Profile
from gamification.models import Achievement

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
        self.stdout.write(self.style.SUCCESS("Done!"))

    def _seed_subjects(self):
        subjects = ["Математика", "Информатика", "Физика", "Химия", "Биология"]
        for name in subjects:
            Subject.objects.get_or_create(slug=slugify(name), defaults={"name": name})
        self.stdout.write("Subjects seeded")

    def _seed_olympiads(self):
        subjects = list(Subject.objects.all())
        for _ in range(10):
            title = fake.catch_phrase()
            olympiad, created = Olympiad.objects.get_or_create(
                slug=slugify(title)[:50],
                defaults={
                    "title": title,
                    "subject": fake.random_element(subjects),
                    "level": fake.random_element(Olympiad.Level.values),
                    "format": fake.random_element(Olympiad.Format.values),
                    "description": fake.text(),
                    "is_published": True,
                },
            )
            if created:
                OlympiadStage.objects.create(
                    olympiad=olympiad,
                    title="Отборочный этап",
                    stage_type=OlympiadStage.StageType.QUALIFYING,
                    start_date=fake.future_datetime(tzinfo=timezone.utc),
                    end_date=fake.future_datetime(tzinfo=timezone.utc),
                )
        self.stdout.write("Olympiads seeded")

    def _seed_courses(self):
        subjects = list(Subject.objects.all())
        for _ in range(10):
            title = fake.catch_phrase()
            Course.objects.get_or_create(
                slug=slugify(title)[:50],
                defaults={
                    "title": title,
                    "subject": fake.random_element(subjects),
                    "level": fake.random_element(Course.Level.values),
                    "format": fake.random_element(Course.Format.values),
                    "description": fake.text(),
                    "url": fake.url(),
                    "is_published": True,
                },
            )
        self.stdout.write("Courses seeded")

    def _seed_achievements(self):
        achievements = [
            ("Первые шаги", Achievement.Trigger.STREAK, 3),
            ("Недельный марафон", Achievement.Trigger.STREAK, 7),
            ("Месяц без пропусков", Achievement.Trigger.STREAK, 30),
            ("Первая олимпиада", Achievement.Trigger.OLYMPIAD, 1),
            ("Первый курс", Achievement.Trigger.COURSE, 1),
        ]
        for title, trigger, threshold in achievements:
            Achievement.objects.get_or_create(
                title=title,
                defaults={
                    "trigger": trigger,
                    "threshold": threshold,
                    "description": title,
                },
            )
        self.stdout.write("Achievements seeded")

    def _seed_users(self):
        subjects = list(Subject.objects.all())
        for _ in range(10):
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
                user.set_password("password123")
                user.save()
                profile = Profile.objects.create(user=user)
                profile.subjects.set(
                    fake.random_elements(
                        subjects, unique=True, length=min(2, len(subjects))
                    )
                )
        self.stdout.write("Users seeded")

    def _seed_registrations(self):
        from olympiads.models import OlympiadRegistration
        from courses.models import CourseEnrollment

        users = list(User.objects.exclude(is_superuser=True))
        olympiads = list(Olympiad.objects.all())
        courses = list(Course.objects.all())

        for user in users:
            for olympiad in fake.random_elements(
                olympiads, unique=True, length=min(3, len(olympiads))
            ):
                OlympiadRegistration.objects.get_or_create(
                    user=user,
                    olympiad=olympiad,
                    defaults={
                        "status": fake.random_element(
                            OlympiadRegistration.Status.values
                        )
                    },
                )
            for course in fake.random_elements(
                courses, unique=True, length=min(3, len(courses))
            ):
                CourseEnrollment.objects.get_or_create(
                    user=user,
                    course=course,
                    defaults={
                        "status": fake.random_element(CourseEnrollment.Status.values)
                    },
                )
        self.stdout.write("Registrations seeded")
