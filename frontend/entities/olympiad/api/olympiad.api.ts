import { apiClient } from "@/shared/api/client";
import type { Olympiad, OlympiadRegistration } from "../model/olympiad.types";
import { buildQueryString } from "@/shared/api/build-query-string";

export interface OlympiadParams {
  search?: string;
  subject?: string;
  level?: string;
  format?: string;
  ordering?: string;
}

export const olympiadApi = {
  list: async (params?: OlympiadParams): Promise<Olympiad[]> => {
    const { data } = await apiClient.get<Olympiad[]>(
      `/olympiads/${buildQueryString(params as Record<string, string | undefined>)}`,
    );
    return data;
  },

  detail: async (slug: string): Promise<Olympiad> => {
    const { data } = await apiClient.get<Olympiad>(`/olympiads/${slug}/`);
    return data;
  },

  create: async (payload: Partial<Olympiad>): Promise<Olympiad> => {
    const { data } = await apiClient.post<Olympiad>("/olympiads/", payload);
    return data;
  },

  update: async (
    slug: string,
    payload: Partial<Olympiad>,
  ): Promise<Olympiad> => {
    const { data } = await apiClient.patch<Olympiad>(
      `/olympiads/${slug}/`,
      payload,
    );
    return data;
  },

  delete: async (slug: string): Promise<void> => {
    await apiClient.delete(`/olympiads/${slug}/`);
  },

  register: async (slug: string): Promise<OlympiadRegistration> => {
    const { data } = await apiClient.post<OlympiadRegistration>(
      `/olympiads/${slug}/register/`,
    );
    return data;
  },

  unregister: async (slug: string): Promise<void> => {
    await apiClient.delete(`/olympiads/${slug}/unregister/`);
  },
};
