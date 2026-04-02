import { useMutation, useQueryClient } from "@tanstack/react-query";
import { courseApi } from "@/entities/course/api/course.api";
import { courseKeys } from "@/entities/course/hooks/use-courses";
import { userKeys } from "@/entities/user/hooks/use-me";

export function useEnrollCourse(slug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => courseApi.enroll(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.detail(slug) });
      qc.invalidateQueries({ queryKey: userKeys.enrollments });
    },
  });
}
