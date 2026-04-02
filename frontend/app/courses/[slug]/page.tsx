import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/shared/ui/badge/badge";
import { EnrollButton } from "@/features/course-enrollment/ui/enroll-button";
import { fetchPublicJson } from "@/shared/api/server";
import {
  FORMAT_LABELS,
  LEVEL_LABELS,
  type Course,
} from "@/entities/course/model/course.types";
import styles from "../../detail-page.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let course: Course | null = null;

  try {
    course = await fetchPublicJson<Course>(`/courses/${slug}/`, {
      cache: "no-store",
    });
  } catch {
    notFound();
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Link href="/courses" className={styles.backLink}>
          ← Все курсы
        </Link>

        <div className={styles.heroHeader}>
          <div className={styles.heroContent}>
            <span className={styles.kicker}>{course.subject_name}</span>
            <h1 className={styles.title}>{course.title}</h1>
            <p className={styles.description}>
              {course.description || "Описание курса пока не добавлено."}
            </p>

            <div className={styles.badges}>
              <Badge>{LEVEL_LABELS[course.level]}</Badge>
              <Badge variant="default">{FORMAT_LABELS[course.format]}</Badge>
              {course.olympiad_title ? (
                <Badge variant="default">{course.olympiad_title}</Badge>
              ) : null}
            </div>
          </div>

          <div className={styles.actions}>
            <EnrollButton slug={course.slug} courseUrl={course.url} />
            <a
              href={course.url}
              target="_blank"
              rel="noreferrer"
              className={styles.actionLink}
            >
              Открыть программу
            </a>
          </div>
        </div>
      </section>

      <div className={styles.contentGrid}>
        <div className={styles.mainColumn}>
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>О курсе</h2>
            <p className={styles.sectionText}>
              {course.description || "Описание курса будет добавлено позднее."}
            </p>
          </section>
        </div>

        <aside className={styles.sideColumn}>
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Ключевые данные</h2>
            <div className={styles.list}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Старт</span>
                <span className={styles.metaValue}>
                  {course.start_date
                    ? new Date(course.start_date).toLocaleDateString("ru-RU")
                    : "в любое время"}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Окончание</span>
                <span className={styles.metaValue}>
                  {course.end_date
                    ? new Date(course.end_date).toLocaleDateString("ru-RU")
                    : "без фиксированной даты"}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Участников</span>
                <span className={styles.metaValue}>
                  {course.enrollments_count ?? 0}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
