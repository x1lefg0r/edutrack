import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { Navbar } from "@/widgets/navbar/ui/navbar";
import { Providers } from "./providers";
import "./globals.css";
import styles from "./layout.module.css";

const sans = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: {
    default: "EduTrack",
    template: "%s | EduTrack",
  },
  description:
    "Платформа для поиска олимпиад и курсов подготовки для российских школьников.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <Providers>
          <div className={styles.shell}>
            <Navbar />
            <main className={styles.main}>{children}</main>
            <footer className={styles.footer}>
              <div className={styles.footerGrid}>
                <div className={styles.brandBlock}>
                  <Link href="/" className={styles.brand}>
                    EduTrack
                  </Link>
                  <p className={styles.footerText}>
                    Серьезная платформа для тех, кто строит академическую
                    траекторию заранее: олимпиады, подготовка, личный прогресс.
                  </p>
                </div>

                <div className={styles.footerColumn}>
                  <h2 className={styles.footerTitle}>Навигация</h2>
                  <Link href="/olympiads" className={styles.footerLink}>
                    Олимпиады
                  </Link>
                  <Link href="/courses" className={styles.footerLink}>
                    Курсы
                  </Link>
                  <Link href="/profile" className={styles.footerLink}>
                    Профиль
                  </Link>
                </div>

                <div className={styles.footerColumn}>
                  <h2 className={styles.footerTitle}>Для старта</h2>
                  <Link href="/login" className={styles.footerLink}>
                    Войти
                  </Link>
                  <Link href="/register" className={styles.footerLink}>
                    Создать аккаунт
                  </Link>
                  <Link href="/creator" className={styles.footerLink}>
                    Панель автора
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
