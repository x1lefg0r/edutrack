import Link from "next/link";
import { CourseCard } from "@/entities/course/ui/course-card";
import type { Course } from "@/entities/course/model/course.types";
import styles from "./courses-widget.module.css";

interface Props {
  courses: Course[];
}

export function CoursesWidget({ courses }: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Популярные курсы</h2>
          <p className={styles.subtitle}>Сильные программы с понятной траекторией</p>
        </div>
        <Link href="/courses" className={styles.link}>
          Все курсы →
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className={styles.empty}>Нет доступных курсов</p>
      ) : (
        <div className={styles.grid}>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}
