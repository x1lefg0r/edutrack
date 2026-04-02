"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button/button";
import { Skeleton } from "@/shared/ui/skeleton/skeleton";
import { useMe } from "@/entities/user/hooks/use-me";
import { CreatorDashboard } from "@/widgets/creator-dashboard/ui/creator-dashboard";
import styles from "./creator-page.module.css";

export function CreatorClientPage() {
  const { data: me, isLoading } = useMe();

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Skeleton className={styles.skeletonHeader} />
        <Skeleton className={styles.skeletonPanel} />
      </div>
    );
  }

  if (!me) {
    return (
      <div className={styles.page}>
        <div className={styles.guardCard}>
          <span className={styles.kicker}>Creator Dashboard</span>
          <h1 className={styles.title}>Авторизуйтесь для доступа к панели</h1>
          <p className={styles.description}>
            Панель управления доступна только после входа и используется для
            создания и редактирования олимпиад и курсов.
          </p>
          <Link href="/login">
            <Button>Войти</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!me.is_staff) {
    return (
      <div className={styles.page}>
        <div className={styles.guardCard}>
          <span className={styles.kicker}>Ограниченный доступ</span>
          <h1 className={styles.title}>Панель доступна только staff-пользователям</h1>
          <p className={styles.description}>
            Если вам нужен доступ к созданию и публикации материалов, обратитесь
            к администратору платформы.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.kicker}>Creator Dashboard</span>
        <h1 className={styles.title}>Управление контентом</h1>
        <p className={styles.description}>
          Создавайте, редактируйте и снимайте с публикации олимпиады и
          подготовительные курсы в одном интерфейсе.
        </p>
      </div>

      <div className={styles.panel}>
        <CreatorDashboard />
      </div>
    </div>
  );
}
