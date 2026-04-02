"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/features/search/ui/search-bar";
import { CatalogFilters } from "@/features/catalog-filters/ui/catalog-filters";
import { useCourses } from "@/entities/course/hooks/use-courses";
import { CourseCard } from "@/entities/course/ui/course-card";
import { Skeleton } from "@/shared/ui/skeleton/skeleton";
import styles from "../catalog-page.module.css";

export function CoursesCatalogPage() {
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

  const { data: courses = [], isLoading } = useCourses(params);
  const filtersCount = [params.search, params.level, params.format].filter(Boolean).length;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.kicker}>Каталог</span>
        <h1 className={styles.title}>Курсы подготовки</h1>
        <p className={styles.description}>
          Подбирайте программы с понятным уровнем сложности, форматом обучения и
          привязкой к конкретным олимпиадам.
        </p>
      </section>

      <div className={styles.controls}>
        <SearchBar placeholder="Найти курс..." />
        <div className={styles.summary}>
          <CatalogFilters type="course" />
          <p className={styles.summaryText}>
            <span className={styles.resultsCount}>{courses.length}</span>{" "}
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
      ) : courses.length === 0 ? (
        <div className={styles.emptyState}>
          По текущим условиям курсы не найдены. Попробуйте расширить запрос или
          сбросить фильтры.
        </div>
      ) : (
        <div className={styles.grid}>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
