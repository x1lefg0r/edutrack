import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseApi, type CourseParams } from "../api/course.api";

export const courseKeys = {
  all: ["courses"] as const,
  list: (params?: CourseParams) => [...courseKeys.all, "list", params] as const,
  detail: (slug: string) => [...courseKeys.all, "detail", slug] as const,
};

export function useCourses(params?: CourseParams) {
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: () => courseApi.list(params),
  });
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: courseKeys.detail(slug),
    queryFn: () => courseApi.detail(slug),
    enabled: !!slug,
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseApi.delete,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: courseKeys.all, refetchType: "all" }),
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseApi.create,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: courseKeys.all, refetchType: "all" }),
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      slug,
      payload,
    }: {
      slug: string;
      payload: Parameters<typeof courseApi.update>[1];
    }) => courseApi.update(slug, payload),
    onSuccess: (_, { slug }) => {
      qc.invalidateQueries({
        queryKey: courseKeys.detail(slug),
        refetchType: "all",
      });
      qc.invalidateQueries({ queryKey: courseKeys.all, refetchType: "all" });
    },
  });
}
