import type { Subject } from "./subject.types";

export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

export interface Profile {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  avatar: string | null;
  bio: string;
  subjects: Subject[];
  current_streak: number;
  max_streak: number;
  last_activity_date: string | null;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string | null;
  trigger: "streak" | "olympiad" | "course";
  threshold: number;
}

export interface UserAchievement {
  id: number;
  achievement: Achievement;
  unlocked_at: string;
}

export interface UserActivity {
  id: number;
  activity_type: string;
  created_at: string;
}
