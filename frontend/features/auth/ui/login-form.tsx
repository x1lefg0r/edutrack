"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/shared/ui/input/input";
import { Button } from "@/shared/ui/button/button";
import { useLogin } from "../hooks/use-login";
import styles from "./login-form.module.css";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending, error } = useLogin();

  const handleSubmit = () => {
    if (!username.trim() || !password.trim()) return;
    login({ username, password });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") handleSubmit();
  };

  return (
    <div className={styles.form}>
      <div className={styles.header}>
        <h1 className={styles.title}>Добро пожаловать</h1>
        <p className={styles.subtitle}>Войдите в свой аккаунт EduTrack</p>
      </div>

      <div className={styles.fields}>
        <Input
          label="Имя пользователя"
          placeholder="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <Input
          label="Пароль"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {error ? (
        <p className={styles.error}>Неверное имя пользователя или пароль</p>
      ) : null}

      <Button
        onClick={handleSubmit}
        loading={isPending}
        className={styles.submit}
        size="lg"
      >
        Войти
      </Button>

      <p className={styles.footer}>
        Нет аккаунта?{" "}
        <Link href="/register" className={styles.link}>
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
