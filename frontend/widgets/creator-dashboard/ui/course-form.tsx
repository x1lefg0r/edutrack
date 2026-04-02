"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/shared/ui/input/input";
import { Button } from "@/shared/ui/button/button";
import { apiClient } from "@/shared/api/client";
import type { Course } from "@/entities/course/model/course.types";
import type { Olympiad } from "@/entities/olympiad/model/olympiad.types";
import type { Subject } from "@/entities/user/model/subject.types";
import {
  useCourse,
  useCreateCourse,
  useUpdateCourse,
} from "@/entities/course/hooks/use-courses";
import styles from "./creator-dashboard.module.css";

interface Props {
  slug?: string;
  onSuccess: () => void;
}

interface CourseFormValues {
  title: string;
  slug: string;
  subject: string;
  olympiad: string;
  description: string;
  level: Course["level"];
  format: Course["format"];
  url: string;
  start_date: string;
  end_date: string;
  is_published: boolean;
}

const EMPTY_FORM: CourseFormValues = {
  title: "",
  slug: "",
  subject: "",
  olympiad: "",
  description: "",
  level: "beginner",
  format: "self_paced",
  url: "",
  start_date: "",
  end_date: "",
  is_published: false,
};

function mapCourseToForm(course: Course): CourseFormValues {
  return {
    title: course.title,
    slug: course.slug,
    subject: String(course.subject),
    olympiad: course.olympiad ? String(course.olympiad) : "",
    description: course.description,
    level: course.level,
    format: course.format,
    url: course.url,
    start_date: course.start_date ?? "",
    end_date: course.end_date ?? "",
    is_published: course.is_published,
  };
}

export function CourseForm({ slug, onSuccess }: Props) {
  const { data: existing } = useCourse(slug ?? "");
  const { mutate: create, isPending: creating } = useCreateCourse();
  const { mutate: update, isPending: updating } = useUpdateCourse();
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects", "all"],
    queryFn: async () => {
      const { data } = await apiClient.get<Subject[]>("/subjects/");
      return data;
    },
  });
  const { data: olympiads = [] } = useQuery({
    queryKey: ["olympiads", "all-for-course-form"],
    queryFn: async () => {
      const { data } = await apiClient.get<Olympiad[]>("/olympiads/");
      return data;
    },
  });

  const [draft, setDraft] = useState<CourseFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = draft ?? (existing ? mapCourseToForm(existing) : EMPTY_FORM);
  const isPending = creating || updating;

  const syncField = <K extends keyof CourseFormValues>(
    key: K,
    value: CourseFormValues[K],
  ) => {
    setError(null);
    setDraft((prev) => ({
      ...(prev ?? form),
      [key]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim() || !form.slug.trim() || !form.subject || !form.url.trim()) {
      setError("Заполните обязательные поля: название, slug, предмет и ссылка на курс.");
      return;
    }

    const payload: Partial<Course> = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      subject: Number(form.subject),
      olympiad: form.olympiad ? Number(form.olympiad) : null,
      description: form.description.trim(),
      level: form.level,
      format: form.format,
      url: form.url.trim(),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      is_published: form.is_published,
    };

    if (slug) {
      update({ slug, payload }, { onSuccess });
      return;
    }

    create(payload, { onSuccess });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        data-autofocus="true"
        label="Название"
        value={form.title}
        onChange={(event) => syncField("title", event.target.value)}
      />

      <Input
        label="Slug"
        placeholder="kurs-po-fizike"
        value={form.slug}
        onChange={(event) => syncField("slug", event.target.value)}
      />

      <div className={styles.formField}>
        <label className={styles.label} htmlFor="course-subject">
          Предмет
        </label>
        <select
          id="course-subject"
          className={styles.select}
          value={form.subject}
          onChange={(event) => syncField("subject", event.target.value)}
        >
          <option value="">Выберите предмет</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formField}>
        <label className={styles.label} htmlFor="course-olympiad">
          Готовит к олимпиаде
        </label>
        <select
          id="course-olympiad"
          className={styles.select}
          value={form.olympiad}
          onChange={(event) => syncField("olympiad", event.target.value)}
        >
          <option value="">Не привязан</option>
          {olympiads.map((olympiad) => (
            <option key={olympiad.id} value={olympiad.id}>
              {olympiad.title}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formField}>
        <label className={styles.label} htmlFor="course-description">
          Описание
        </label>
        <textarea
          id="course-description"
          className={styles.textarea}
          placeholder="О чём курс, что изучается"
          value={form.description}
          onChange={(event) => syncField("description", event.target.value)}
        />
      </div>

      <Input
        label="Ссылка на курс"
        value={form.url}
        onChange={(event) => syncField("url", event.target.value)}
      />

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className={styles.label} htmlFor="course-level">
            Уровень
          </label>
          <select
            id="course-level"
            className={styles.select}
            value={form.level}
            onChange={(event) =>
              syncField("level", event.target.value as Course["level"])
            }
          >
            <option value="beginner">Начинающий</option>
            <option value="intermediate">Средний</option>
            <option value="advanced">Продвинутый</option>
          </select>
        </div>

        <div className={styles.formField}>
          <label className={styles.label} htmlFor="course-format">
            Формат
          </label>
          <select
            id="course-format"
            className={styles.select}
            value={form.format}
            onChange={(event) =>
              syncField("format", event.target.value as Course["format"])
            }
          >
            <option value="self_paced">Самостоятельный</option>
            <option value="live">С преподавателем</option>
          </select>
        </div>
      </div>

      <div className={styles.formRow}>
        <Input
          label="Дата начала"
          type="date"
          value={form.start_date}
          onChange={(event) => syncField("start_date", event.target.value)}
        />
        <Input
          label="Дата окончания"
          type="date"
          value={form.end_date}
          onChange={(event) => syncField("end_date", event.target.value)}
        />
      </div>

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={form.is_published}
          onChange={(event) => syncField("is_published", event.target.checked)}
        />
        Опубликовать
      </label>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={isPending}>
        {slug ? "Сохранить" : "Создать"}
      </Button>
    </form>
  );
}
