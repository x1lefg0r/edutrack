import { apiClient } from "@/shared/api/client";
import type { Course, CourseEnrollment } from "../model/course.types";
import { buildQueryString } from "@/shared/api/build-query-string";

export interface CourseParams {
  search?: string;
  subject?: string;
  level?: string;
  format?: string;
  ordering?: string;
}

export const courseApi = {
  list: async (params?: CourseParams): Promise<Course[]> => {
    const { data } = await apiClient.get<Course[]>(
      `/courses/${buildQueryString(params as Record<string, string | undefined>)}`,
    );
    return data;
  },

  detail: async (slug: string): Promise<Course> => {
    const { data } = await apiClient.get<Course>(`/courses/${slug}/`);
    return data;
  },

  create: async (payload: Partial<Course>): Promise<Course> => {
    const { data } = await apiClient.post<Course>("/courses/", payload);
    return data;
  },

  update: async (slug: string, payload: Partial<Course>): Promise<Course> => {
    const { data } = await apiClient.patch<Course>(
      `/courses/${slug}/`,
      payload,
    );
    return data;
  },

  delete: async (slug: string): Promise<void> => {
    await apiClient.delete(`/courses/${slug}/`);
  },

  enroll: async (slug: string): Promise<CourseEnrollment> => {
    const { data } = await apiClient.post<CourseEnrollment>(
      `/courses/${slug}/enroll/`,
    );
    return data;
  },
};
