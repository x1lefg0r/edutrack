"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/shared/ui/badge/badge";
import { Button } from "@/shared/ui/button/button";
import { Skeleton } from "@/shared/ui/skeleton/skeleton";
import {
  useMe,
  useMyAchievements,
  useMyEnrollments,
  useMyRegistrations,
  useUpdateMe,
} from "@/entities/user/hooks/use-me";
import { ActivityHeatmap } from "@/widgets/activity-heatmap/ui/activity-heatmap";
import styles from "./profile-page.module.css";

function buildActivityDays(dates: Array<string | null | undefined>) {
  const grouped = new Map<string, number>();

  dates.forEach((value) => {
    if (!value) return;

    const date =
      value.length > 10 ? new Date(value).toISOString().slice(0, 10) : value;

    grouped.set(date, (grouped.get(date) ?? 0) + 1);
  });

  return Array.from(grouped.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

export function ProfileClientPage() {
  const { data: me, isLoading: loadingMe } = useMe();
  const { data: registrations = [], isLoading: loadingRegistrations } =
    useMyRegistrations();
  const { data: enrollments = [], isLoading: loadingEnrollments } =
    useMyEnrollments();
  const { data: achievements = [], isLoading: loadingAchievements } =
    useMyAchievements();
  const { mutate: updateMe, isPending: savingProfile } = useUpdateMe();

  const [bioDraft, setBioDraft] = useState<string | null>(null);

  const activityDays = useMemo(
    () =>
      buildActivityDays([
        me?.last_activity_date,
        ...registrations.map((registration) => registration.registered_at),
        ...enrollments.map((enrollment) => enrollment.enrolled_at),
        ...achievements.map((achievement) => achievement.unlocked_at),
      ]),
    [achievements, enrollments, me?.last_activity_date, registrations],
  );

  if (loadingMe) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <Skeleton className={styles.skeletonTitle} />
          <Skeleton className={styles.skeletonSubtitle} />
        </div>
        <div className={styles.layout}>
          <div className={styles.main}>
            <Skeleton className={styles.skeletonPanel} />
            <Skeleton className={styles.skeletonPanelLarge} />
          </div>
          <Skeleton className={styles.skeletonSidebar} />
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className={styles.page}>
        <div className={styles.guestCard}>
          <span className={styles.kicker}>Профиль</span>
          <h1 className={styles.title}>Войдите, чтобы открыть личный кабинет</h1>
          <p className={styles.description}>
            После авторизации вы сможете отслеживать достижения, регистрации на
            олимпиады и прогресс по подготовительным курсам.
          </p>
          <div className={styles.guestActions}>
            <Link href="/login">
              <Button>Войти</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Создать аккаунт</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const bio = bioDraft ?? me.bio ?? "";
  const isLoadingLists =
    loadingRegistrations || loadingEnrollments || loadingAchievements;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.kicker}>Личный кабинет</span>
        <h1 className={styles.title}>{me.username}</h1>
        <p className={styles.description}>
          Аналитика активности, зарегистрированные олимпиады и ваши текущие
          учебные траектории.
        </p>
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>
          <section className={styles.panel}>
            <div className={styles.profileTop}>
              <div className={styles.identity}>
                {me.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={me.avatar} alt={me.username} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarFallback}>
                    {me.username[0].toUpperCase()}
                  </div>
                )}

                <div className={styles.identityText}>
                  <h2 className={styles.sectionTitle}>{me.username}</h2>
                  <p className={styles.sectionText}>{me.email}</p>
                </div>
              </div>

              <div className={styles.badges}>
                {me.subjects.map((subject) => (
                  <Badge key={subject.id}>{subject.name}</Badge>
                ))}
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{me.current_streak}</span>
                <span className={styles.statLabel}>текущий стрик</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{me.max_streak}</span>
                <span className={styles.statLabel}>максимальный стрик</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{achievements.length}</span>
                <span className={styles.statLabel}>достижений</span>
              </div>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Тепловая карта активности</h2>
                <p className={styles.sectionText}>
                  Активность собирается из достижений, регистраций и записей на
                  курсы за последние полгода.
                </p>
              </div>
            </div>
            <ActivityHeatmap activities={activityDays} />
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Достижения</h2>
                <p className={styles.sectionText}>Последние разблокированные награды</p>
              </div>
            </div>

            {loadingAchievements ? (
              <Skeleton className={styles.listSkeleton} />
            ) : achievements.length === 0 ? (
              <p className={styles.empty}>Пока нет достижений. Первая активность уже рядом.</p>
            ) : (
              <div className={styles.list}>
                {achievements.map((userAchievement) => (
                  <div key={userAchievement.id} className={styles.listItem}>
                    <div>
                      <span className={styles.itemTitle}>
                        {userAchievement.achievement.title}
                      </span>
                      <p className={styles.itemMeta}>
                        {userAchievement.achievement.description}
                      </p>
                    </div>
                    <span className={styles.itemDate}>
                      {new Date(userAchievement.unlocked_at).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Мои олимпиады</h2>
                <p className={styles.sectionText}>Активные и завершенные регистрации</p>
              </div>
            </div>

            {loadingRegistrations ? (
              <Skeleton className={styles.listSkeleton} />
            ) : registrations.length === 0 ? (
              <p className={styles.empty}>Вы еще не зарегистрировались ни на одну олимпиаду.</p>
            ) : (
              <div className={styles.list}>
                {registrations.map((registration) => (
                  <div key={registration.id} className={styles.listItem}>
                    <div>
                      <Link
                        href={`/olympiads/${registration.olympiad_slug}`}
                        className={styles.itemLink}
                      >
                        {registration.olympiad_title}
                      </Link>
                      <p className={styles.itemMeta}>Статус: {registration.status}</p>
                    </div>
                    <span className={styles.itemDate}>
                      {new Date(registration.registered_at).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Мои курсы</h2>
                <p className={styles.sectionText}>Текущие и завершенные enrollments</p>
              </div>
            </div>

            {loadingEnrollments ? (
              <Skeleton className={styles.listSkeleton} />
            ) : enrollments.length === 0 ? (
              <p className={styles.empty}>Вы пока не записаны ни на один курс.</p>
            ) : (
              <div className={styles.list}>
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className={styles.listItem}>
                    <div>
                      <Link
                        href={`/courses/${enrollment.course_slug}`}
                        className={styles.itemLink}
                      >
                        {enrollment.course_title}
                      </Link>
                      <p className={styles.itemMeta}>Статус: {enrollment.status}</p>
                    </div>
                    <span className={styles.itemDate}>
                      {new Date(enrollment.enrolled_at).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className={styles.sidebar}>
          <section className={styles.panel}>
            <h2 className={styles.sectionTitle}>Настройки профиля</h2>
            <p className={styles.sectionText}>
              Здесь можно актуализировать короткое описание профиля.
            </p>

            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>О себе</label>
              <textarea
                className={styles.textarea}
                value={bio}
                onChange={(event) => setBioDraft(event.target.value)}
                placeholder="Опишите учебные интересы и цели"
              />
            </div>

            <Button
              onClick={() =>
                updateMe(
                  { bio: bio.trim() },
                  { onSuccess: () => setBioDraft(null) },
                )
              }
              loading={savingProfile}
            >
              Сохранить описание
            </Button>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.sectionTitle}>Краткая сводка</h2>
            <div className={styles.summaryList}>
              <div className={styles.summaryRow}>
                <span>Предметов в фокусе</span>
                <strong>{me.subjects.length}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Регистраций</span>
                <strong>{registrations.length}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Enrollments</span>
                <strong>{enrollments.length}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Последняя активность</span>
                <strong>
                  {me.last_activity_date
                    ? new Date(me.last_activity_date).toLocaleDateString("ru-RU")
                    : "нет данных"}
                </strong>
              </div>
            </div>
          </section>

          {isLoadingLists ? (
            <Skeleton className={styles.skeletonSidebarPanel} />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
