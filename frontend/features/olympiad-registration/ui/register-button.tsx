"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button/button";
import { useMe, useMyRegistrations } from "@/entities/user/hooks/use-me";
import {
  useRegisterOlympiad,
  useUnregisterOlympiad,
} from "../hooks/use-register-olympiad";

interface Props {
  slug: string;
}

export function RegisterButton({ slug }: Props) {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: registrations } = useMyRegistrations();
  const { mutate: register, isPending: registering } = useRegisterOlympiad(slug);
  const { mutate: unregister, isPending: unregistering } =
    useUnregisterOlympiad(slug);

  if (!me) {
    return (
      <Button variant="outline" onClick={() => router.push("/login")}>
        Войдите, чтобы зарегистрироваться
      </Button>
    );
  }

  const isRegistered = registrations?.some(
    (registration) => registration.olympiad_slug === slug,
  );

  if (isRegistered) {
    return (
      <Button
        variant="outline"
        onClick={() => unregister()}
        loading={unregistering}
      >
        Отменить регистрацию
      </Button>
    );
  }

  return (
    <Button onClick={() => register()} loading={registering}>
      Зарегистрироваться
    </Button>
  );
}
