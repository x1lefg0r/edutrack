"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/features/search/ui/search-bar";
import { CatalogFilters } from "@/features/catalog-filters/ui/catalog-filters";
import { useOlympiads } from "@/entities/olympiad/hooks/use-olympiads";
import { OlympiadCard } from "@/entities/olympiad/ui/olympiad-card";
import { Skeleton } from "@/shared/ui/skeleton/skeleton";
import styles from "../catalog-page.module.css";

export function OlympiadsCatalogPage() {
  const searchParams = useSearchParams();
  const paramsKey = searchParams?.toString() ?? "";

  const params = useMemo(() => {
    const current = new URLSearchParams(paramsKey);

    return {
      search: current.get("search") || undefined,
      level: current.get("level") || undefined,
      format: current.get("format") || undefined,
    };
  }, [paramsKey]);

  const { data: olympiads = [], isLoading } = useOlympiads(params);
  const filtersCount = [params.search, params.level, params.format].filter(Boolean).length;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.kicker}>Каталог</span>
        <h1 className={styles.title}>Олимпиады</h1>
        <p className={styles.description}>
          Изучайте актуальные олимпиады по уровням, форматам и предметам, чтобы
          выстроить сильную стратегию участия заранее.
        </p>
      </section>

      <div className={styles.controls}>
        <SearchBar placeholder="Найти олимпиаду..." />
        <div className={styles.summary}>
          <CatalogFilters type="olympiad" />
          <p className={styles.summaryText}>
            <span className={styles.resultsCount}>{olympiads.length}</span>{" "}
            результатов{filtersCount ? ` • активных фильтров: ${filtersCount}` : ""}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className={styles.skeletonCard} />
          ))}
        </div>
      ) : olympiads.length === 0 ? (
        <div className={styles.emptyState}>
          По выбранным условиям пока ничего не найдено. Попробуйте снять часть
          фильтров или изменить поисковый запрос.
        </div>
      ) : (
        <div className={styles.grid}>
          {olympiads.map((olympiad) => (
            <OlympiadCard key={olympiad.id} olympiad={olympiad} />
          ))}
        </div>
      )}
    </div>
  );
}
