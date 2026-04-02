import { Hero } from "@/widgets/hero/ui/hero";
import { CoursesWidget } from "@/widgets/courses-widget/ui/courses-widget";
import { OlympiadsWidget } from "@/widgets/olympiads-widget/ui/olympiads-widget";
import {
  fetchPublicJson,
  type HomepageResponse,
  type LeaderboardEntry,
} from "@/shared/api/server";
import styles from "./page.module.css";

async function getHomepageData() {
  try {
    return await fetchPublicJson<HomepageResponse>("/homepage/", {
      cache: "no-store",
    });
  } catch {
    return {
      upcoming_olympiads: [],
      popular_courses: [],
      subjects: [],
    } satisfies HomepageResponse;
  }
}

async function getLeaderboard() {
  try {
    return await fetchPublicJson<LeaderboardEntry[]>("/leaderboard/", {
      cache: "no-store",
    });
  } catch {
    return [];
  }
}

export default async function Home() {
  const [homepage, leaderboard] = await Promise.all([
    getHomepageData(),
    getLeaderboard(),
  ]);

  return (
    <div className={styles.page}>
      <Hero />

      <div className={styles.sections}>
        <section className={styles.overviewGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.kicker}>Предметы</span>
                <h2 className={styles.panelTitle}>Ключевые направления подготовки</h2>
              </div>
              <p className={styles.panelText}>
                Сфокусируйтесь на дисциплинах, где олимпиадная траектория приносит
                максимальный эффект.
              </p>
            </div>

            {homepage.subjects.length === 0 ? (
              <p className={styles.empty}>Список предметов пока не загружен.</p>
            ) : (
              <div className={styles.subjectGrid}>
                {homepage.subjects.map((subject) => (
                  <article key={subject.id} className={styles.subjectCard}>
                    <span className={styles.subjectName}>{subject.name}</span>
                    <p className={styles.subjectDescription}>
                      {subject.description ||
                        "Подбор олимпиад, курсов и материалов по выбранному предмету."}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className={styles.panel}>
            <div className={styles.panelHeaderCompact}>
              <span className={styles.kicker}>Рейтинг</span>
              <h2 className={styles.panelTitle}>Лидеры по достижениям</h2>
            </div>

            {leaderboard.length === 0 ? (
              <p className={styles.empty}>Рейтинг появится после первых достижений.</p>
            ) : (
              <div className={styles.leaderboardList}>
                {leaderboard.slice(0, 6).map((entry, index) => (
                  <div key={entry.username} className={styles.leaderRow}>
                    <span className={styles.rank}>{index + 1}</span>
                    <div className={styles.leaderMeta}>
                      <span className={styles.leaderName}>{entry.username}</span>
                      <span className={styles.leaderStats}>
                        Текущий стрик: {entry.current_streak} • Макс: {entry.max_streak}
                      </span>
                    </div>
                    <span className={styles.leaderScore}>
                      {entry.achievements_count} достиж.
                    </span>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </section>

        <OlympiadsWidget olympiads={homepage.upcoming_olympiads} />
        <CoursesWidget courses={homepage.popular_courses} />
      </div>
    </div>
  );
}
