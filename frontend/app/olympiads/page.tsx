import { Suspense } from "react";
import { OlympiadsCatalogPage } from "./olympiads-catalog-page";

export default function OlympiadsPage() {
  return (
    <Suspense fallback={null}>
      <OlympiadsCatalogPage />
    </Suspense>
  );
}
