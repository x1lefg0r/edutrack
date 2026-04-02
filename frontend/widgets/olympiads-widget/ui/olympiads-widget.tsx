import Link from "next/link";
import { OlympiadCard } from "@/entities/olympiad/ui/olympiad-card";
import type { Olympiad } from "@/entities/olympiad/model/olympiad.types";
import styles from "./olympiads-widget.module.css";

interface Props {
  olympiads: Olympiad[];
}

export function OlympiadsWidget({ olympiads }: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Предстоящие олимпиады</h2>
          <p className={styles.subtitle}>Ближайшие по срокам старта и этапам</p>
        </div>
        <Link href="/olympiads" className={styles.link}>
          Все олимпиады →
        </Link>
      </div>

      {olympiads.length === 0 ? (
        <p className={styles.empty}>Нет предстоящих олимпиад</p>
      ) : (
        <div className={styles.grid}>
          {olympiads.map((olympiad) => (
            <OlympiadCard key={olympiad.id} olympiad={olympiad} />
          ))}
        </div>
      )}
    </section>
  );
}
