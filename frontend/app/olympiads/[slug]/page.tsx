import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/shared/ui/badge/badge";
import { RegisterButton } from "@/features/olympiad-registration/ui/register-button";
import {
  fetchPublicJson,
} from "@/shared/api/server";
import {
  FORMAT_LABELS,
  LEVEL_LABELS,
  STAGE_LABELS,
  type Olympiad,
} from "@/entities/olympiad/model/olympiad.types";
import styles from "../../detail-page.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function OlympiadDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let olympiad: Olympiad | null = null;

  try {
    olympiad = await fetchPublicJson<Olympiad>(`/olympiads/${slug}/`, {
      cache: "no-store",
    });
  } catch {
    notFound();
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Link href="/olympiads" className={styles.backLink}>
          ← Все олимпиады
        </Link>

        <div className={styles.heroHeader}>
          <div className={styles.heroContent}>
            <span className={styles.kicker}>{olympiad.subject_name}</span>
            <h1 className={styles.title}>{olympiad.title}</h1>
            <p className={styles.description}>{olympiad.description}</p>

            <div className={styles.badges}>
              <Badge>{LEVEL_LABELS[olympiad.level]}</Badge>
              <Badge variant="default">{FORMAT_LABELS[olympiad.format]}</Badge>
              {olympiad.min_grade && olympiad.max_grade ? (
                <Badge variant="default">
                  {olympiad.min_grade}-{olympiad.max_grade} кл.
                </Badge>
              ) : null}
            </div>
          </div>

          <div className={styles.actions}>
            <RegisterButton slug={olympiad.slug} />
            {olympiad.organizer_url ? (
              <a
                href={olympiad.organizer_url}
                target="_blank"
                rel="noreferrer"
                className={styles.actionLink}
              >
                Сайт организатора
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <div className={styles.contentGrid}>
        <div className={styles.mainColumn}>
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Описание</h2>
            <p className={styles.sectionText}>
              {olympiad.description || "Описание организатор пока не добавил."}
            </p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Этапы</h2>
            {olympiad.stages.length === 0 ? (
              <p className={styles.empty}>Этапы пока не опубликованы.</p>
            ) : (
              <div className={styles.list}>
                {olympiad.stages.map((stage) => (
                  <article key={stage.id} className={styles.stageItem}>
                    <span className={styles.stageTitle}>
                      {stage.title} • {STAGE_LABELS[stage.stage_type]}
                    </span>
                    <span className={styles.stageMeta}>
                      {new Date(stage.start_date).toLocaleDateString("ru-RU")} -{" "}
                      {new Date(stage.end_date).toLocaleDateString("ru-RU")}
                    </span>
                    {stage.description ? (
                      <span className={styles.stageMeta}>{stage.description}</span>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className={styles.sideColumn}>
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Ключевые данные</h2>
            <div className={styles.list}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Участников</span>
                <span className={styles.metaValue}>
                  {olympiad.participants_count ?? 0}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Ближайший этап</span>
                <span className={styles.metaValue}>
                  {olympiad.next_stage_date
                    ? new Date(olympiad.next_stage_date).toLocaleDateString("ru-RU")
                    : olympiad.stages[0]
                      ? new Date(olympiad.stages[0].start_date).toLocaleDateString(
                          "ru-RU",
                        )
                      : "нет данных"}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
