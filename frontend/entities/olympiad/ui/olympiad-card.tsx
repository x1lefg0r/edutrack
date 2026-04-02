import Link from "next/link";
import { Badge } from "@/shared/ui/badge/badge";
import {
  type Olympiad,
  LEVEL_LABELS,
  FORMAT_LABELS,
} from "../model/olympiad.types";
import styles from "./olympiad-card.module.css";

interface Props {
  olympiad: Olympiad;
}

export function OlympiadCard({ olympiad }: Props) {
  const derivedStageDate =
    olympiad.next_stage_date ??
    olympiad.stages.find((stage) => new Date(stage.start_date) >= new Date())
      ?.start_date ??
    olympiad.stages[0]?.start_date ??
    null;

  const nextStage = derivedStageDate
    ? new Date(derivedStageDate).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <Link href={`/olympiads/${olympiad.slug}`} className={styles.card}>
      <div className={styles.header}>
        <span className={styles.subject}>{olympiad.subject_name}</span>
        <Badge>{LEVEL_LABELS[olympiad.level]}</Badge>
      </div>

      <h3 className={styles.title}>{olympiad.title}</h3>

      {olympiad.description ? (
        <p className={styles.description}>{olympiad.description}</p>
      ) : null}

      <div className={styles.footer}>
        <div className={styles.meta}>
          <Badge variant="default">{FORMAT_LABELS[olympiad.format]}</Badge>
          {olympiad.min_grade && olympiad.max_grade ? (
            <Badge variant="default">
              {olympiad.min_grade}-{olympiad.max_grade} кл.
            </Badge>
          ) : null}
        </div>
        <div className={styles.stats}>
          {nextStage ? (
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
              {nextStage}
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
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {olympiad.participants_count ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
}
