"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { auth } from "../lib/auth";

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => auth.logout(),
    onSuccess: () => {
      qc.clear();
      router.push("/");
    },
  });
}
