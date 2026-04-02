import { useMutation, useQueryClient } from "@tanstack/react-query";
import { olympiadApi } from "@/entities/olympiad/api/olympiad.api";
import { olympiadKeys } from "@/entities/olympiad/hooks/use-olympiads";
import { userKeys } from "@/entities/user/hooks/use-me";

export function useRegisterOlympiad(slug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => olympiadApi.register(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: olympiadKeys.detail(slug) });
      qc.invalidateQueries({ queryKey: userKeys.registrations });
    },
  });
}

export function useUnregisterOlympiad(slug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => olympiadApi.unregister(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: olympiadKeys.detail(slug) });
      qc.invalidateQueries({ queryKey: userKeys.registrations });
    },
  });
}
