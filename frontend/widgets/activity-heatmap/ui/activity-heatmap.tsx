"use client";

import { useMemo } from "react";
import { cn } from "@/shared/lib/cn";
import styles from "./activity-heatmap.module.css";

interface ActivityDay {
  date: string;
  count: number;
}

interface Props {
  activities: ActivityDay[];
  weeks?: number;
}

const DAYS = ["Пн", null, "Ср", null, "Пт", null, "Вс"];
const MONTHS = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];

function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

export function ActivityHeatmap({ activities, weeks = 26 }: Props) {
  const grid = useMemo(() => {
    const activityMap = new Map(activities.map((activity) => [activity.date, activity.count]));
    const today = new Date();
    const totalDays = weeks * 7;
    const days: { date: string; count: number; month: number }[] = [];

    for (let index = totalDays - 1; index >= 0; index -= 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - index);

      const dateStr = date.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        count: activityMap.get(dateStr) ?? 0,
        month: date.getMonth(),
      });
    }

    const weekColumns: (typeof days)[] = [];

    for (let index = 0; index < days.length; index += 7) {
      weekColumns.push(days.slice(index, index + 7));
    }

    return weekColumns;
  }, [activities, weeks]);

  const monthLabels = useMemo(() => {
    const labels: { month: string; colIndex: number }[] = [];
    let lastMonth = -1;

    grid.forEach((week, index) => {
      const month = week[0]?.month;

      if (month !== undefined && month !== lastMonth) {
        labels.push({ month: MONTHS[month], colIndex: index });
        lastMonth = month;
      }
    });

    return labels;
  }, [grid]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.days} aria-hidden="true">
          {DAYS.map((day, index) => (
            <span key={index} className={styles.dayLabel}>
              {day}
            </span>
          ))}
        </div>

        <div className={styles.grid}>
          <div className={styles.months}>
            {monthLabels.map(({ month, colIndex }) => (
              <span
                key={`${month}-${colIndex}`}
                className={styles.monthLabel}
                style={{ gridColumn: colIndex + 1 }}
              >
                {month}
              </span>
            ))}
          </div>

          <div
            className={styles.cells}
            role="grid"
            aria-label="Карта активности"
          >
            {grid.map((week, weekIndex) => (
              <div key={weekIndex} className={styles.week} role="row">
                {week.map((day) => {
                  const label =
                    day.count === 0
                      ? `${day.date}: нет активности`
                      : `${day.date}: ${day.count} ${day.count === 1 ? "действие" : day.count < 5 ? "действия" : "действий"}`;
                  return (
                    <div
                      key={day.date}
                      role="gridcell"
                      className={cn(styles.cell, styles[`level${getLevel(day.count)}`])}
                      aria-label={label}
                      tabIndex={0}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendLabel}>Меньше</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(styles.cell, styles[`level${level}`])}
          />
        ))}
        <span className={styles.legendLabel}>Больше</span>
      </div>
    </div>
  );
}
