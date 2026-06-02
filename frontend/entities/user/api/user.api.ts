import { apiClient } from "@/shared/api/client";
import type {
  Profile,
  UserAchievement,
  UserActivity,
} from "../model/user.types";
import type { OlympiadRegistration } from "@/entities/olympiad/model/olympiad.types";
import type { CourseEnrollment } from "@/entities/course/model/course.types";

export const userApi = {
  me: async (): Promise<Profile> => {
    const { data } = await apiClient.get<Profile>("/profile/me/");
    return data;
  },

  updateMe: async (payload: Partial<Profile>): Promise<Profile> => {
    const { data } = await apiClient.patch<Profile>("/profile/me/", payload);
    return data;
  },

  updateAvatar: async (file: File): Promise<Profile> => {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await apiClient.patch<Profile>("/profile/me/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  myRegistrations: async (): Promise<OlympiadRegistration[]> => {
    const { data } = await apiClient.get<OlympiadRegistration[]>(
      "/profile/me/registrations/",
    );
    return data;
  },

  myEnrollments: async (): Promise<CourseEnrollment[]> => {
    const { data } = await apiClient.get<CourseEnrollment[]>(
      "/profile/me/enrollments/",
    );
    return data;
  },

  myAchievements: async (): Promise<UserAchievement[]> => {
    const { data } = await apiClient.get<UserAchievement[]>(
      "/profile/me/achievements/",
    );
    return data;
  },

  activities: async (): Promise<UserActivity[]> => {
    const { data } = await apiClient.get<UserActivity[]>(
      "/profile/me/activities/",
    );
    return data;
  },
};
