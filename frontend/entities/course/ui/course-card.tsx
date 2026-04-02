import Link from "next/link";
import { Badge } from "@/shared/ui/badge/badge";
import {
  type Course,
  LEVEL_LABELS,
  FORMAT_LABELS,
} from "../model/course.types";
import styles from "./course-card.module.css";

interface Props {
  course: Course;
}

export function CourseCard({ course }: Props) {
  const startDate = course.start_date
    ? new Date(course.start_date).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <Link href={`/courses/${course.slug}`} className={styles.card}>
      <div className={styles.header}>
        <span className={styles.subject}>{course.subject_name}</span>
        <Badge>{LEVEL_LABELS[course.level]}</Badge>
      </div>

      <h3 className={styles.title}>{course.title}</h3>

      {course.description ? (
        <p className={styles.description}>{course.description}</p>
      ) : null}

      {course.olympiad_title ? (
        <p className={styles.olympiad}>Подготовка к: {course.olympiad_title}</p>
      ) : null}

      <div className={styles.footer}>
        <div className={styles.meta}>
          <Badge variant="default">{FORMAT_LABELS[course.format]}</Badge>
        </div>
        <div className={styles.stats}>
          {startDate ? (
            <span className={styles.stat}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {startDate}
            </span>
          ) : null}
          <span className={styles.stat}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            {course.enrollments_count ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
}
