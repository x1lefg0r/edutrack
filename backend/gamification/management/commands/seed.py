import json
import requests
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

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2"

SUBJECTS_RU = {
    "mathematics": "Математика",
    "physics": "Физика",
    "informatics": "Информатика",
    "biology": "Биология",
    "chemistry": "Химия",
}

_OLYMPIAD_EXAMPLES = {
    "mathematics": ("Всероссийская олимпиада школьников по математике", "Проверяет умение решать нестандартные задачи на комбинаторику, теорию чисел и геометрию. Ориентирована на учеников 9–11 классов с углублённым изучением предмета."),
    "physics": ("Олимпиада «Физтех»", "Оценивает навыки применения законов механики и электродинамики к нестандартным ситуациям. Задания требуют глубокого понимания физических явлений, а не только знания формул."),
    "informatics": ("Всероссийская олимпиада школьников по информатике", "Проверяет умение разрабатывать эффективные алгоритмы и реализовывать их на языке программирования. Задачи охватывают динамическое программирование, графы и структуры данных."),
    "biology": ("Олимпиада «Ломоносов» по биологии", "Проверяет знание клеточной биологии, генетики и экологии на уровне выше школьной программы. Включает как теоретические задания, так и анализ биологических данных."),
    "chemistry": ("Менделеевская олимпиада по химии", "Оценивает знания органической и неорганической химии, умение решать расчётные задачи. Участники выполняют как теоретические, так и экспериментальные задания."),
}

_COURSE_EXAMPLES = {
    "mathematics": ("Олимпиадная математика: комбинаторика и теория чисел", "Курс охватывает ключевые темы олимпиадной математики: принцип Дирихле, НОД/НОК, диофантовы уравнения и комбинаторные тождества. Каждый модуль содержит разбор задач реальных олимпиад и домашние задания с проверкой."),
    "physics": ("Олимпиадная физика: механика и термодинамика", "Курс строится на разборе задач ВсОШ и «Физтеха» с упором на нестандартные модели и оценочные методы. Включает видеоуроки, тесты и разбор ошибок с преподавателем."),
    "informatics": ("Алгоритмы и структуры данных для олимпиадного программирования", "Покрывает графовые алгоритмы, сортировки, двоичный поиск и динамическое программирование на примерах задач Codeforces и ВсОШ. Практика на онлайн-судье с автоматической проверкой решений."),
    "biology": ("Олимпиадная биология: молекулярная биология и генетика", "Курс углублённо разбирает молекулярные механизмы наследственности, клеточный цикл и эволюционную биологию. Включает работу с научными текстами и решение задач формата ВсОШ."),
    "chemistry": ("Олимпиадная химия: органический синтез и реакционные механизмы", "Разбирает реакции замещения, присоединения и перегруппировки на уровне Менделеевской олимпиады. Содержит расчётные задачи, практические эксперименты и разбор ошибок."),
}


def _build_prompt(kind: str, subject_key: str) -> str:
    subject_name = SUBJECTS_RU[subject_key]
    if kind == "olympiads":
        ex_title, ex_desc = _OLYMPIAD_EXAMPLES[subject_key]
        return (
            f'Ты — эксперт по российскому школьному образованию. Придумай 4 реалистичные российские школьные олимпиады по предмету «{subject_name}».\n\n'
            f'Требования: title — официальное или правдоподобное название, description — ровно 2 предложения: что проверяет и на кого рассчитана.\n\n'
            f'Пример одного объекта: {{"title": "{ex_title}", "description": "{ex_desc}"}}\n\n'
            f'Верни строго JSON без пояснений и markdown: {{"items": [{{"title": "...", "description": "..."}}, ...]}}'
        )
    else:
        ex_title, ex_desc = _COURSE_EXAMPLES[subject_key]
        return (
            f'Ты — методист онлайн-образования. Придумай 4 онлайн-курса по предмету «{subject_name}» для подготовки школьников к олимпиадам.\n\n'
            f'Требования: title — конкретное название с указанием темы, description — ровно 2 предложения: что изучают и как построено обучение.\n\n'
            f'Пример одного объекта: {{"title": "{ex_title}", "description": "{ex_desc}"}}\n\n'
            f'Верни строго JSON без пояснений и markdown: {{"items": [{{"title": "...", "description": "..."}}, ...]}}'
        )


class Command(BaseCommand):
    help = "Seed database with fake data"

    def add_arguments(self, parser):
        parser.add_argument("--flush", action="store_true", help="Очистить базу перед сидингом")
        parser.add_argument("--use-ai", action="store_true", help="Генерировать контент через Ollama")

    def handle(self, *args, **options):
        self.use_ai = options["use_ai"]

        if options["flush"]:
            self._flush()

        self._seed_subjects()
        self._seed_achievements()
        self._seed_olympiads()
        self._seed_courses()
        self._seed_users()
        self._seed_registrations()
        self._seed_activities()
        self.stdout.write(self.style.SUCCESS("Done!"))

    def _flush(self):
        UserAchievement.objects.all().delete()
        UserActivity.objects.all().delete()
        CourseEnrollment.objects.all().delete()
        OlympiadRegistration.objects.all().delete()
        User.objects.filter(is_staff=False, is_superuser=False).delete()
        Course.objects.all().delete()
        Olympiad.objects.all().delete()  # cascades to OlympiadStage
        Subject.objects.all().delete()
        Achievement.objects.all().delete()
        self.stdout.write("Database flushed")

    def _generate_content(self, subject_key: str, kind: str) -> list[dict]:
        prompt = _build_prompt(kind, subject_key)

        try:
            response = requests.post(
                OLLAMA_URL,
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False, "format": "json"},
                timeout=60,
            )
            response.raise_for_status()
            raw = response.json().get("response", "")
            data = json.loads(raw)
            items = data.get("items", [])
            if isinstance(items, list) and items:
                normalized = [
                    {
                        "title": str(item.get("title") or item.get("name") or fake.sentence(nb_words=5).rstrip(".")),
                        "description": str(item.get("description") or item.get("desc") or item.get("text") or fake.text(max_nb_chars=200)),
                    }
                    for item in items
                    if isinstance(item, dict)
                ]
                if normalized:
                    return normalized[:4]
        except Exception as exc:
            self.stdout.write(self.style.WARNING(f"  Ollama fallback ({subject_key}, {kind}): {exc}"))

        return self._faker_content(count=4)

    def _faker_content(self, count: int) -> list[dict]:
        return [
            {
                "title": fake.sentence(nb_words=5).rstrip("."),
                "description": fake.text(max_nb_chars=200),
            }
            for _ in range(count)
        ]

    def _seed_subjects(self):
        for slug, name in SUBJECTS_RU.items():
            Subject.objects.get_or_create(slug=slug, defaults={"name": name})
        self.stdout.write("Subjects seeded")

    def _seed_achievements(self):
        achievements = [
            ("Первые шаги", Achievement.Trigger.STREAK, 3, "3 дня подряд"),
            ("Недельный марафон", Achievement.Trigger.STREAK, 7, "7 дней подряд"),
            ("Марафонец", Achievement.Trigger.STREAK, 14, "14 дней подряд"),
            ("Месяц без пропусков", Achievement.Trigger.STREAK, 30, "30 дней подряд"),
            ("Первая олимпиада", Achievement.Trigger.OLYMPIAD, 1, "1 олимпиада"),
            ("Начало пути", Achievement.Trigger.OLYMPIAD, 2, "2 олимпиады"),
            ("Коллекционер", Achievement.Trigger.OLYMPIAD, 5, "5 олимпиад"),
            ("Первый курс", Achievement.Trigger.COURSE, 1, "1 курс завершён"),
            ("Студент", Achievement.Trigger.COURSE, 3, "3 курса завершено"),
            ("Продвинутый", Achievement.Trigger.COURSE, 5, "5 курсов завершено"),
            ("Завис на платформе", Achievement.Trigger.COURSE, 10, "10 курсов завершено"),
        ]

        for title, trigger, threshold, description in achievements:
            Achievement.objects.get_or_create(
                title=title,
                defaults={"trigger": trigger, "threshold": threshold, "description": description},
            )

        self.stdout.write("Achievements seeded")

    def _seed_olympiads(self):
        for subject in Subject.objects.all():
            if self.use_ai and subject.slug in SUBJECTS_RU:
                items = self._generate_content(subject.slug, "olympiads")
                self.stdout.write(f"  AI → {len(items)} олимпиад для «{subject.name}»")
            else:
                items = self._faker_content(count=4)

            for item in items:
                title = item["title"][:200]
                olympiad, created = Olympiad.objects.get_or_create(
                    slug=slugify(title)[:50],
                    defaults={
                        "title": title,
                        "subject": subject,
                        "level": random.choice(Olympiad.Level.values),
                        "format": random.choice(Olympiad.Format.values),
                        "description": item["description"],
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
        olympiads = list(Olympiad.objects.all())

        for subject in Subject.objects.all():
            if self.use_ai and subject.slug in SUBJECTS_RU:
                items = self._generate_content(subject.slug, "courses")
                self.stdout.write(f"  AI → {len(items)} курсов для «{subject.name}»")
            else:
                items = self._faker_content(count=4)

            for item in items:
                title = item["title"][:200]
                start = fake.future_date()
                end = start + timedelta(days=random.randint(10, 60))

                Course.objects.get_or_create(
                    slug=slugify(title)[:50],
                    defaults={
                        "title": title,
                        "subject": subject,
                        "olympiad": random.choice([None, None, random.choice(olympiads)]),
                        "level": random.choice(Course.Level.values),
                        "format": random.choice(Course.Format.values),
                        "description": item["description"],
                        "url": fake.url(),
                        "start_date": start,
                        "end_date": end,
                        "is_published": True,
                    },
                )

        self.stdout.write("Courses seeded")

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
                    defaults={"status": random.choice(OlympiadRegistration.Status.values)},
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
            days_count = {"lazy": random.randint(5, 15), "active": random.randint(20, 40), "hardcore": random.randint(45, 60)}[behavior]
            active_days = sorted(random.sample(range(60), days_count))

            for day_offset in active_days:
                base_date = timezone.now() - timedelta(days=day_offset)

                for _ in range(random.randint(1, 3)):
                    activity_dt = base_date.replace(
                        hour=random.randint(8, 22),
                        minute=random.randint(0, 59),
                        second=random.randint(0, 59),
                        microsecond=0,
                    )
                    UserActivity.objects.create(
                        user=user,
                        activity_type=random.choice(activity_types),
                        created_at=activity_dt,
                    )

            profile = Profile.objects.get(user=user)
            streak = self._calculate_streak(active_days)
            profile.current_streak = streak
            profile.max_streak = max(streak, random.randint(streak, streak + 10))
            profile.last_activity_date = (
                (timezone.now() - timedelta(days=active_days[0])).date() if active_days else None
            )
            profile.save()

            self._assign_achievements(user)

        self.stdout.write("Activities seeded")

    def _calculate_streak(self, active_days: list[int]) -> int:
        if not active_days:
            return 0

        active_days = sorted(active_days)

        if active_days[0] > 1:
            return 0

        streak = 1
        for i in range(1, len(active_days)):
            if active_days[i] - active_days[i - 1] == 1:
                streak += 1
            else:
                break

        return streak

    def _assign_achievements(self, user) -> None:
        profile = Profile.objects.get(user=user)

        stats = {
            Achievement.Trigger.STREAK: profile.current_streak,
            Achievement.Trigger.OLYMPIAD: OlympiadRegistration.objects.filter(user=user).count(),
            Achievement.Trigger.COURSE: CourseEnrollment.objects.filter(
                user=user, status=CourseEnrollment.Status.COMPLETED
            ).count(),
        }

        for achievement in Achievement.objects.all():
            value = stats.get(achievement.trigger)
            if value is not None and value >= achievement.threshold:
                UserAchievement.objects.get_or_create(user=user, achievement=achievement)
