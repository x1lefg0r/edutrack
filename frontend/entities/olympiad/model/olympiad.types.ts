export interface OlympiadStage {
  id: number;
  title: string;
  stage_type: "qualifying" | "semifinal" | "final";
  start_date: string;
  end_date: string;
  description: string;
}

export interface Olympiad {
  id: number;
  title: string;
  slug: string;
  subject: number;
  subject_name: string;
  description: string;
  format: "online" | "offline" | "hybrid";
  level: "school" | "regional" | "national" | "international";
  organizer_url: string;
  min_grade: number | null;
  max_grade: number | null;
  is_published: boolean;
  stages: OlympiadStage[];
  participants_count?: number;
  next_stage_date?: string | null;
  url: string;
}

export interface OlympiadRegistration {
  id: number;
  olympiad: number;
  olympiad_title: string;
  olympiad_slug: string;
  status: "registered" | "participated" | "winner" | "disqualified";
  registered_at: string;
  result_score: number | null;
}

export const LEVEL_LABELS: Record<Olympiad["level"], string> = {
  school: "Школьный",
  regional: "Региональный",
  national: "Всероссийский",
  international: "Международный",
};

export const FORMAT_LABELS: Record<Olympiad["format"], string> = {
  online: "Онлайн",
  offline: "Офлайн",
  hybrid: "Гибридный",
};

export const STAGE_LABELS: Record<OlympiadStage["stage_type"], string> = {
  qualifying: "Отборочный",
  semifinal: "Полуфинал",
  final: "Финал",
};
