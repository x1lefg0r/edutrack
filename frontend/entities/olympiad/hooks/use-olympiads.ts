import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { olympiadApi, type OlympiadParams } from "../api/olympiad.api";

export const olympiadKeys = {
  all: ["olympiads"] as const,
  list: (params?: OlympiadParams) =>
    [...olympiadKeys.all, "list", params] as const,
  detail: (slug: string) => [...olympiadKeys.all, "detail", slug] as const,
};

export function useOlympiads(params?: OlympiadParams) {
  return useQuery({
    queryKey: olympiadKeys.list(params),
    queryFn: () => olympiadApi.list(params),
  });
}

export function useOlympiad(slug: string) {
  return useQuery({
    queryKey: olympiadKeys.detail(slug),
    queryFn: () => olympiadApi.detail(slug),
    enabled: !!slug,
  });
}

export function useDeleteOlympiad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: olympiadApi.delete,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: olympiadKeys.all, refetchType: "all" }),
  });
}

export function useCreateOlympiad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: olympiadApi.create,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: olympiadKeys.all, refetchType: "all" }),
  });
}

export function useUpdateOlympiad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      slug,
      payload,
    }: {
      slug: string;
      payload: Parameters<typeof olympiadApi.update>[1];
    }) => olympiadApi.update(slug, payload),
    onSuccess: (_, { slug }) => {
      qc.invalidateQueries({
        queryKey: olympiadKeys.detail(slug),
        refetchType: "all",
      });
      qc.invalidateQueries({ queryKey: olympiadKeys.all, refetchType: "all" });
    },
  });
}
