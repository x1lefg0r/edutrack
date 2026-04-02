export interface Course {
  id: number;
  title: string;
  slug: string;
  subject: number;
  subject_name: string;
  olympiad: number | null;
  olympiad_title: string | null;
  description: string;
  format: "self_paced" | "live";
  level: "beginner" | "intermediate" | "advanced";
  url: string;
  start_date: string | null;
  end_date: string | null;
  is_published: boolean;
  enrollments_count?: number;
}

export interface CourseEnrollment {
  id: number;
  course: number;
  course_title: string;
  course_slug: string;
  status: "enrolled" | "in_progress" | "completed" | "dropped";
  enrolled_at: string;
}

export const LEVEL_LABELS: Record<Course["level"], string> = {
  beginner: "Начинающий",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

export const FORMAT_LABELS: Record<Course["format"], string> = {
  self_paced: "Самостоятельный",
  live: "С преподавателем",
};
