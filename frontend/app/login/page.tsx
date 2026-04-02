import { LoginForm } from "@/features/auth/ui/login-form";
import styles from "../auth-page.module.css";

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.aside}>
          <span className={styles.badge}>EduTrack Account</span>
          <h1 className={styles.title}>Возвращайтесь к своей траектории</h1>
          <p className={styles.description}>
            Отслеживайте олимпиады, записи на курсы и личный прогресс в одном
            месте без лишнего шума.
          </p>

          <div className={styles.facts}>
            <div className={styles.fact}>
              <span className={styles.factValue}>1</span>
              <span className={styles.factLabel}>личный кабинет</span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factValue}>24/7</span>
              <span className={styles.factLabel}>доступ к подборке</span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factValue}>∞</span>
              <span className={styles.factLabel}>вариантов роста</span>
            </div>
          </div>
        </aside>

        <div className={styles.formPane}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
