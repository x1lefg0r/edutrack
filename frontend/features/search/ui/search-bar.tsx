"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./search-bar.module.css";

interface Props {
  placeholder?: string;
  redirectTo?: string;
}

interface SearchDraft {
  source: string;
  value: string;
}

export function SearchBar({ placeholder = "Поиск...", redirectTo }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname ?? "/";
  const searchParams = useSearchParams();
  const searchValue = searchParams?.get("search") ?? "";

  const [draft, setDraft] = useState<SearchDraft>({
    source: searchValue,
    value: searchValue,
  });

  const query = draft.source === searchValue ? draft.value : searchValue;

  const updateQuery = (value: string) => {
    setDraft({
      source: searchValue,
      value,
    });
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    const value = query.trim();

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    setDraft({
      source: value,
      value,
    });

    const target = redirectTo ?? currentPath;
    const href = params.toString() ? `${target}?${params.toString()}` : target;
    router.push(href);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") handleSearch();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputWrapper}>
        <svg
          className={styles.icon}
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          className={styles.input}
          type="text"
          aria-label={placeholder}
          placeholder={placeholder}
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        {query ? (
          <button
            className={styles.clear}
            aria-label="Очистить поиск"
            onClick={() => updateQuery("")}
          >
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>
      <button className={styles.button} onClick={handleSearch}>
        Найти
      </button>
    </div>
  );
}
