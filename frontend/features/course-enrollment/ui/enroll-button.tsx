"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button/button";
import { useMe, useMyEnrollments } from "@/entities/user/hooks/use-me";
import { useEnrollCourse } from "../hooks/use-enroll-course";

interface Props {
  slug: string;
  courseUrl: string;
}

export function EnrollButton({ slug, courseUrl }: Props) {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: enrollments } = useMyEnrollments();
  const { mutate: enroll, isPending } = useEnrollCourse(slug);

  if (!me) {
    return (
      <Button variant="outline" onClick={() => router.push("/login")}>
        Войдите, чтобы записаться
      </Button>
    );
  }

  const isEnrolled = enrollments?.some((enrollment) => enrollment.course_slug === slug);

  if (isEnrolled) {
    return (
      <Button onClick={() => window.open(courseUrl, "_blank", "noopener,noreferrer")}>
        Перейти к курсу →
      </Button>
    );
  }

  return (
    <Button onClick={() => enroll()} loading={isPending}>
      Записаться на курс
    </Button>
  );
}
