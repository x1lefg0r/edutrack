"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import styles from "./catalog-filter.module.css";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

const OLYMPIAD_FILTERS: FilterGroup[] = [
  {
    key: "level",
    label: "Уровень",
    options: [
      { label: "Школьный", value: "school" },
      { label: "Региональный", value: "regional" },
      { label: "Всероссийский", value: "national" },
      { label: "Международный", value: "international" },
    ],
  },
  {
    key: "format",
    label: "Формат",
    options: [
      { label: "Онлайн", value: "online" },
      { label: "Офлайн", value: "offline" },
      { label: "Гибридный", value: "hybrid" },
    ],
  },
];

const COURSE_FILTERS: FilterGroup[] = [
  {
    key: "level",
    label: "Уровень",
    options: [
      { label: "Начинающий", value: "beginner" },
      { label: "Средний", value: "intermediate" },
      { label: "Продвинутый", value: "advanced" },
    ],
  },
  {
    key: "format",
    label: "Формат",
    options: [
      { label: "Самостоятельный", value: "self_paced" },
      { label: "С преподавателем", value: "live" },
    ],
  },
];

interface Props {
  type: "olympiad" | "course";
}

export function CatalogFilters({ type }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname ?? "/";
  const searchParams = useSearchParams();
  const filters = type === "olympiad" ? OLYMPIAD_FILTERS : COURSE_FILTERS;

  const pushParams = (params: URLSearchParams) => {
    const href = params.toString()
      ? `${currentPath}?${params.toString()}`
      : currentPath;
    router.push(href);
  };

  const toggle = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    pushParams(params);
  };

  const setValue = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    pushParams(params);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    filters.forEach(({ key }) => params.delete(key));
    pushParams(params);
  };

  const hasActiveFilters = filters.some(({ key }) => searchParams?.has(key));

  return (
    <div className={styles.wrapper}>
      <div className={styles.desktop}>
        {filters.map(({ key, options }) => (
          <div key={key} className={styles.group}>
            {options.map(({ label, value }) => {
              const active = searchParams?.get(key) === value;

              return (
                <button
                  key={value}
                  className={cn(styles.chip, active && styles.chipActive)}
                  onClick={() => toggle(key, value)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className={styles.mobile}>
        {filters.map(({ key, label, options }) => (
          <label key={key} className={styles.selectField}>
            <span className={styles.selectLabel}>{label}</span>
            <select
              className={styles.select}
              value={searchParams?.get(key) ?? ""}
              onChange={(event) => setValue(key, event.target.value)}
            >
              <option value="">Все</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {hasActiveFilters ? (
        <button className={styles.clear} onClick={clearAll}>
          Сбросить
        </button>
      ) : null}
    </div>
  );
}
