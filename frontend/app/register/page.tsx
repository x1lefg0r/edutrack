import { RegisterForm } from "@/features/auth/ui/register-form";
import styles from "../auth-page.module.css";

export default function RegisterPage() {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.aside}>
          <span className={styles.badge}>Новый аккаунт</span>
          <h1 className={styles.title}>Соберите сильный старт заранее</h1>
          <p className={styles.description}>
            Создайте профиль, чтобы сохранять олимпиады, курсы подготовки и
            видеть динамику собственного прогресса по неделям.
          </p>

          <div className={styles.facts}>
            <div className={styles.fact}>
              <span className={styles.factValue}>5 мин</span>
              <span className={styles.factLabel}>на старт</span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factValue}>100%</span>
              <span className={styles.factLabel}>ваш прогресс</span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factValue}>1</span>
              <span className={styles.factLabel}>единая система</span>
            </div>
          </div>
        </aside>

        <div className={styles.formPane}>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
