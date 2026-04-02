import { Suspense } from "react";
import { SearchBar } from "@/features/search/ui/search-bar";
import styles from "./hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.badge}>Платформа для подбора олимпиад и курсов</div>

        <h1 className={styles.title}>
          Инвестируй в будущее
          <br />
          <span className={styles.titleAccent}>сильного старта в вуз</span>
        </h1>

        <p className={styles.subtitle}>
          Подберите олимпиады, программы подготовки и траекторию развития для
          школьника, который нацелен на серьезный результат.
        </p>

        <div className={styles.search}>
          <Suspense fallback={null}>
            <SearchBar
              placeholder="Поиск олимпиад и курсов..."
              redirectTo="/olympiads"
            />
          </Suspense>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>500+</span>
            <span className={styles.statLabel}>олимпиад</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>200+</span>
            <span className={styles.statLabel}>курсов</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>10 000+</span>
            <span className={styles.statLabel}>участников</span>
          </div>
        </div>
      </div>

      <div className={styles.gradient} />
    </section>
  );
}
