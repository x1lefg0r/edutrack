"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import { Input } from "@/shared/ui/input/input";
import { Button } from "@/shared/ui/button/button";
import type { Subject } from "@/entities/user/model/subject.types";
import type { Olympiad } from "@/entities/olympiad/model/olympiad.types";
import {
  useOlympiad,
  useCreateOlympiad,
  useUpdateOlympiad,
} from "@/entities/olympiad/hooks/use-olympiads";
import styles from "./creator-dashboard.module.css";

interface Props {
  slug?: string;
  onSuccess: () => void;
}

interface OlympiadFormValues {
  title: string;
  slug: string;
  subject: string;
  description: string;
  level: Olympiad["level"];
  format: Olympiad["format"];
  organizer_url: string;
  min_grade: string;
  max_grade: string;
  is_published: boolean;
}

const EMPTY_FORM: OlympiadFormValues = {
  title: "",
  slug: "",
  subject: "",
  description: "",
  level: "school",
  format: "online",
  organizer_url: "",
  min_grade: "",
  max_grade: "",
  is_published: false,
};

function mapOlympiadToForm(olympiad: Olympiad): OlympiadFormValues {
  return {
    title: olympiad.title,
    slug: olympiad.slug,
    subject: String(olympiad.subject),
    description: olympiad.description,
    level: olympiad.level,
    format: olympiad.format,
    organizer_url: olympiad.organizer_url,
    min_grade: olympiad.min_grade ? String(olympiad.min_grade) : "",
    max_grade: olympiad.max_grade ? String(olympiad.max_grade) : "",
    is_published: olympiad.is_published,
  };
}

export function OlympiadForm({ slug, onSuccess }: Props) {
  const { data: existing } = useOlympiad(slug ?? "");
  const { mutate: create, isPending: creating } = useCreateOlympiad();
  const { mutate: update, isPending: updating } = useUpdateOlympiad();
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects", "all"],
    queryFn: async () => {
      const { data } = await apiClient.get<Subject[]>("/subjects/");
      return data;
    },
  });

  const [draft, setDraft] = useState<OlympiadFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = draft ?? (existing ? mapOlympiadToForm(existing) : EMPTY_FORM);
  const isPending = creating || updating;

  const syncField = <K extends keyof OlympiadFormValues>(
    key: K,
    value: OlympiadFormValues[K],
  ) => {
    setError(null);
    setDraft((prev) => ({
      ...(prev ?? form),
      [key]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim() || !form.slug.trim() || !form.subject) {
      setError("Заполните обязательные поля: название, slug и предмет.");
      return;
    }

    const payload: Partial<Olympiad> = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      subject: Number(form.subject),
      description: form.description.trim(),
      level: form.level,
      format: form.format,
      organizer_url: form.organizer_url.trim(),
      min_grade: form.min_grade ? Number(form.min_grade) : null,
      max_grade: form.max_grade ? Number(form.max_grade) : null,
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
        placeholder="olimpiada-po-fizike"
        value={form.slug}
        onChange={(event) => syncField("slug", event.target.value)}
      />

      <div className={styles.formField}>
        <label className={styles.label} htmlFor="olympiad-subject">
          Предмет
        </label>
        <select
          id="olympiad-subject"
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
        <label className={styles.label} htmlFor="olympiad-description">
          Описание
        </label>
        <textarea
          id="olympiad-description"
          className={styles.textarea}
          placeholder="Что важно знать об этапах, требованиях и сроках"
          value={form.description}
          onChange={(event) => syncField("description", event.target.value)}
        />
      </div>

      <Input
        label="Сайт организатора"
        value={form.organizer_url}
        onChange={(event) => syncField("organizer_url", event.target.value)}
      />

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className={styles.label} htmlFor="olympiad-level">
            Уровень
          </label>
          <select
            id="olympiad-level"
            className={styles.select}
            value={form.level}
            onChange={(event) =>
              syncField("level", event.target.value as Olympiad["level"])
            }
          >
            <option value="school">Школьный</option>
            <option value="regional">Региональный</option>
            <option value="national">Всероссийский</option>
            <option value="international">Международный</option>
          </select>
        </div>

        <div className={styles.formField}>
          <label className={styles.label} htmlFor="olympiad-format">
            Формат
          </label>
          <select
            id="olympiad-format"
            className={styles.select}
            value={form.format}
            onChange={(event) =>
              syncField("format", event.target.value as Olympiad["format"])
            }
          >
            <option value="online">Онлайн</option>
            <option value="offline">Офлайн</option>
            <option value="hybrid">Гибридный</option>
          </select>
        </div>
      </div>

      <div className={styles.formRow}>
        <Input
          label="Минимальный класс"
          type="number"
          min="1"
          max="11"
          value={form.min_grade}
          onChange={(event) => syncField("min_grade", event.target.value)}
        />
        <Input
          label="Максимальный класс"
          type="number"
          min="1"
          max="11"
          value={form.max_grade}
          onChange={(event) => syncField("max_grade", event.target.value)}
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
