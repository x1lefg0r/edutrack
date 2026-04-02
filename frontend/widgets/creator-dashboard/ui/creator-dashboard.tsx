"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/shared/ui/button/button";
import { Badge } from "@/shared/ui/badge/badge";
import {
  useOlympiads,
  useDeleteOlympiad,
} from "@/entities/olympiad/hooks/use-olympiads";
import {
  useCourses,
  useDeleteCourse,
} from "@/entities/course/hooks/use-courses";
import { OlympiadForm } from "./olympiad-form";
import { CourseForm } from "./course-form";
import styles from "./creator-dashboard.module.css";

type Tab = "olympiads" | "courses";
type Modal = { type: "olympiad" | "course"; slug?: string } | null;

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function CreatorDashboard() {
  const [tab, setTab] = useState<Tab>("olympiads");
  const [modal, setModal] = useState<Modal>(null);
  const [search, setSearch] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const { data: olympiads, isLoading: loadingOlympiads } = useOlympiads(
    search ? { search } : undefined,
  );
  const { data: courses, isLoading: loadingCourses } = useCourses(
    search ? { search } : undefined,
  );
  const { mutate: deleteOlympiad } = useDeleteOlympiad();
  const { mutate: deleteCourse } = useDeleteCourse();

  const openModal = (
    nextModal: Exclude<Modal, null>,
    opener?: HTMLElement | null,
  ) => {
    openerRef.current = opener ?? null;
    setModal(nextModal);
  };

  const closeModal = useCallback(() => {
    setModal(null);
    window.requestAnimationFrame(() => openerRef.current?.focus());
  }, []);

  const handleTabKeyDown = (
    event: React.KeyboardEvent,
    nextTab: Tab,
    nextTabId: string,
  ) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      setTab(nextTab);
      window.requestAnimationFrame(() => {
        document.getElementById(nextTabId)?.focus();
      });
    }
  };

  useEffect(() => {
    if (!modal) return;

    const preferredFocusElement = modalRef.current?.querySelector<HTMLElement>(
      "[data-autofocus='true']",
    );
    const focusableElements = Array.from(
      modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
    );
    (preferredFocusElement ?? focusableElements[0])?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
        return;
      }

      if (event.key !== "Tab") return;

      const activeFocusableElements = Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      );
      const firstElement = activeFocusableElements[0];
      const lastElement =
        activeFocusableElements[activeFocusableElements.length - 1];

      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeModal, modal]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.toolbar}>
        <div className={styles.tabs} role="tablist" aria-label="Тип контента">
          <button
            id="creator-tab-olympiads"
            className={tab === "olympiads" ? styles.tabActive : styles.tab}
            role="tab"
            aria-selected={tab === "olympiads"}
            aria-controls="creator-panel-olympiads"
            tabIndex={tab === "olympiads" ? 0 : -1}
            onKeyDown={(event) =>
              handleTabKeyDown(event, "courses", "creator-tab-courses")
            }
            onClick={() => setTab("olympiads")}
          >
            Олимпиады
          </button>
          <button
            id="creator-tab-courses"
            className={tab === "courses" ? styles.tabActive : styles.tab}
            role="tab"
            aria-selected={tab === "courses"}
            aria-controls="creator-panel-courses"
            tabIndex={tab === "courses" ? 0 : -1}
            onKeyDown={(event) =>
              handleTabKeyDown(event, "olympiads", "creator-tab-olympiads")
            }
            onClick={() => setTab("courses")}
          >
            Курсы
          </button>
        </div>

        <div className={styles.toolbarRight}>
          <input
            className={styles.search}
            aria-label="Поиск в панели управления"
            placeholder="Поиск..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button
            size="sm"
            onClick={(event) => {
              openModal(
                { type: tab === "olympiads" ? "olympiad" : "course" },
                event.currentTarget,
              );
            }}
          >
            + Добавить
          </Button>
        </div>
      </div>

      {tab === "olympiads" ? (
        <div
          id="creator-panel-olympiads"
          className={styles.list}
          role="tabpanel"
          aria-labelledby="creator-tab-olympiads"
        >
          {loadingOlympiads ? (
            <p className={styles.empty} role="status" aria-live="polite">
              Загрузка...
            </p>
          ) : olympiads?.length === 0 ? (
            <p className={styles.empty}>Нет олимпиад</p>
          ) : (
            olympiads?.map((olympiad) => (
              <div key={olympiad.id} className={styles.row}>
                <div className={styles.rowInfo}>
                  <span className={styles.rowTitle}>{olympiad.title}</span>
                  <div className={styles.rowMeta}>
                    <Badge>{olympiad.subject_name}</Badge>
                    <Badge
                      variant={olympiad.is_published ? "success" : "warning"}
                    >
                      {olympiad.is_published ? "Опубликована" : "Черновик"}
                    </Badge>
                  </div>
                </div>

                <div className={styles.rowActions}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(event) => {
                      openModal(
                        { type: "olympiad", slug: olympiad.slug },
                        event.currentTarget,
                      );
                    }}
                  >
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      if (confirm(`Удалить "${olympiad.title}"?`)) {
                        deleteOlympiad(olympiad.slug);
                      }
                    }}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div
          id="creator-panel-courses"
          className={styles.list}
          role="tabpanel"
          aria-labelledby="creator-tab-courses"
        >
          {loadingCourses ? (
            <p className={styles.empty} role="status" aria-live="polite">
              Загрузка...
            </p>
          ) : courses?.length === 0 ? (
            <p className={styles.empty}>Нет курсов</p>
          ) : (
            courses?.map((course) => (
              <div key={course.id} className={styles.row}>
                <div className={styles.rowInfo}>
                  <span className={styles.rowTitle}>{course.title}</span>
                  <div className={styles.rowMeta}>
                    <Badge>{course.subject_name}</Badge>
                    <Badge variant={course.is_published ? "success" : "warning"}>
                      {course.is_published ? "Опубликован" : "Черновик"}
                    </Badge>
                  </div>
                </div>

                <div className={styles.rowActions}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(event) => {
                      openModal(
                        { type: "course", slug: course.slug },
                        event.currentTarget,
                      );
                    }}
                  >
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      if (confirm(`Удалить "${course.title}"?`)) {
                        deleteCourse(course.slug);
                      }
                    }}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {modal ? (
        <div className={styles.overlay} onClick={closeModal}>
          <div
            ref={modalRef}
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="creator-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 id="creator-modal-title" className={styles.modalTitle}>
                {modal.slug ? "Редактировать" : "Создать"}{" "}
                {modal.type === "olympiad" ? "олимпиаду" : "курс"}
              </h2>
              <button
                className={styles.modalClose}
                aria-label="Закрыть"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            {modal.type === "olympiad" ? (
              <OlympiadForm
                key={`olympiad:${modal.slug ?? "create"}`}
                slug={modal.slug}
                onSuccess={closeModal}
              />
            ) : (
              <CourseForm
                key={`course:${modal.slug ?? "create"}`}
                slug={modal.slug}
                onSuccess={closeModal}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
