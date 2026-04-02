"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { auth, type LoginPayload } from "../lib/auth";
import { userKeys } from "@/entities/user/hooks/use-me";

export function useLogin() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => auth.login(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.me });
      router.push("/profile");
    },
  });
}
