import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user.api";

function hasAccessToken() {
  return (
    typeof window !== "undefined" &&
    Boolean(localStorage.getItem("access_token"))
  );
}

export const userKeys = {
  me: ["me"] as const,
  registrations: ["me", "registrations"] as const,
  enrollments: ["me", "enrollments"] as const,
  achievements: ["me", "achievements"] as const,
  activities: ["me", "activities"] as const,
};

export function useMe() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: userApi.me,
    retry: false,
    enabled: hasAccessToken(),
  });
}

export function useMyRegistrations() {
  return useQuery({
    queryKey: userKeys.registrations,
    queryFn: userApi.myRegistrations,
    retry: false,
    enabled: hasAccessToken(),
  });
}

export function useMyEnrollments() {
  return useQuery({
    queryKey: userKeys.enrollments,
    queryFn: userApi.myEnrollments,
    retry: false,
    enabled: hasAccessToken(),
  });
}

export function useMyAchievements() {
  return useQuery({
    queryKey: userKeys.achievements,
    queryFn: userApi.myAchievements,
    retry: false,
    enabled: hasAccessToken(),
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateMe,
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.me }),
  });
}
