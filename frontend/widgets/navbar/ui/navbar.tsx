"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMe } from "@/entities/user/hooks/use-me";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { cn } from "@/shared/lib/cn";
import styles from "./navbar.module.css";

const NAV_LINKS = [
  { href: "/olympiads", label: "Олимпиады" },
  { href: "/courses", label: "Курсы" },
];

export function Navbar() {
  const pathname = usePathname();
  const currentPath = pathname ?? "/";
  const { data: me } = useMe();
  const { mutate: logout } = useLogout();

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          EduTrack
        </Link>

        <div className={styles.links}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                styles.link,
                currentPath.startsWith(href) && styles.linkActive,
              )}
            >
              {label}
            </Link>
          ))}
          {me?.is_staff ? (
            <Link
              href="/creator"
              className={cn(
                styles.link,
                currentPath === "/creator" && styles.linkActive,
              )}
            >
              Управление
            </Link>
          ) : null}
        </div>

        <div className={styles.actions}>
          {me ? (
            <>
              <Link href="/profile" className={styles.avatar}>
                {me.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={me.avatar}
                    alt={me.username}
                    className={styles.avatarImg}
                  />
                ) : (
                  <span className={styles.avatarFallback}>
                    {me.username[0].toUpperCase()}
                  </span>
                )}
              </Link>
              <button className={styles.logout} onClick={() => logout()}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.loginLink}>
                Войти
              </Link>
              <Link href="/register" className={styles.registerLink}>
                Регистрация
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
