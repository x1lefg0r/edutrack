# EduTrack

Веб-платформа для подготовки школьников к олимпиадам. Помогает находить олимпиады и курсы по предметам, отслеживать прогресс и зарабатывать достижения за активность.

## Стек

**Backend**
- Python 3.13, Django 4.2, Django REST Framework
- PostgreSQL (psycopg3)
- JWT-аутентификация — `djangorestframework-simplejwt`
- OpenAPI-документация — `drf-spectacular` → `/api/schema/swagger/`
- Профилирование запросов — `django-silk` → `/silk/`

**Frontend**
- Next.js 16, React 19, TypeScript
- TanStack React Query — серверный стейт
- Tailwind CSS 4, shadcn/ui
- Архитектура — [Feature-Sliced Design](https://feature-sliced.design/)
- TypeScript-типы генерируются автоматически из OpenAPI схемы

## Быстрый старт

```bash
# 1. Запустить PostgreSQL
docker-compose up -d

# 2. Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # заполнить переменные
python manage.py migrate
python manage.py runserver  # → http://localhost:8000

# 3. Frontend
cd frontend
npm install
npm run dev                 # → http://localhost:3000
```

## Переменные окружения

Создай `backend/.env` на основе `.env.example`:

```env
DJANGO_SECRET_KEY=
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
POSTGRES_DB=edutrack
POSTGRES_USER=edutrack_user
POSTGRES_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
```

## Сидер с AI-генерацией

Команда `seed` заполняет базу тестовыми данными. С флагом `--use-ai` названия и описания олимпиад/курсов генерирует локальная LLM через [Ollama](https://ollama.com) — вместо случайных faker-строк получаются реалистичные русские названия.

```bash
# Установить Ollama и скачать модель
brew install ollama
ollama pull llama3.2
ollama serve

# Заполнить базу (с очисткой)
cd backend
python manage.py seed --flush --use-ai

# Без AI — быстрый вариант с faker
python manage.py seed --flush
```

Сидер создаёт 5 предметов × 4 олимпиады + 4 курса = 20 олимпиад и 20 курсов, 15 пользователей с историей активности, достижениями и регистрациями.

## API-документация

После запуска бэкенда доступны:

| URL | Описание |
|-----|----------|
| http://localhost:8000/api/schema/swagger/ | Swagger UI — интерактивная документация |
| http://localhost:8000/api/schema/ | Скачать OpenAPI схему (JSON/YAML) |
| http://localhost:8000/silk/ | Профилировщик SQL-запросов |

Обновить TypeScript-типы на фронтенде (бэкенд должен быть запущен):

```bash
cd frontend && npm run gen:types
```

Типы сохраняются в `shared/api/schema.d.ts` и отражают актуальные Django-сериализаторы — если поменять поле на бэкенде, TypeScript подсветит где фронт сломался.

## Структура проекта

```
edutrack/
├── backend/
│   ├── users/          # Профили, JWT-аутентификация
│   ├── olympiads/      # Олимпиады, этапы, регистрации
│   ├── courses/        # Курсы, записи на курс
│   ├── subjects/       # Предметы (математика, физика и т.д.)
│   ├── gamification/   # Достижения, стрики, тепловая карта активности
│   └── config/         # Настройки Django, URL-маршрутизация
└── frontend/
    ├── app/            # Страницы (Next.js App Router)
    ├── widgets/        # Крупные UI-блоки: navbar, heatmap, creator dashboard
    ├── features/       # Бизнес-логика: auth, фильтры каталога, запись на курс
    ├── entities/       # Доменные модели: olympiad, course, user
    └── shared/         # API-клиент, базовые UI-компоненты, утилиты
```
