import { Suspense } from "react";
import { CoursesCatalogPage } from "./courses-catalog-page";

export default function CoursesPage() {
  return (
    <Suspense fallback={null}>
      <CoursesCatalogPage />
    </Suspense>
  );
}
