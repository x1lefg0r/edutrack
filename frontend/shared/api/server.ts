import type { Course } from "@/entities/course/model/course.types";
import type { Olympiad } from "@/entities/olympiad/model/olympiad.types";
import type { Subject } from "@/entities/user/model/subject.types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

interface FetchPublicJsonOptions extends Omit<RequestInit, "next"> {
  revalidate?: number;
}

export interface HomepageResponse {
  upcoming_olympiads: Olympiad[];
  popular_courses: Course[];
  subjects: Subject[];
}

export interface LeaderboardEntry {
  username: string;
  achievements_count: number;
  current_streak: number;
  max_streak: number;
}

export async function fetchPublicJson<T>(
  path: string,
  options: FetchPublicJsonOptions = {},
) {
  const { revalidate = 300, headers, ...init } = options;
  const requestInit: RequestInit & { next?: { revalidate: number } } = {
    ...init,
    headers: {
      Accept: "application/json",
      ...headers,
    },
  };

  if (init.cache !== "no-store") {
    requestInit.next = { revalidate };
  }

  const response = await fetch(`${API_BASE}${path}`, requestInit);

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`);
  }

  return (await response.json()) as T;
}
