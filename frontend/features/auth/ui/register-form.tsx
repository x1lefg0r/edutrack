"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/shared/ui/input/input";
import { Button } from "@/shared/ui/button/button";
import { auth } from "../lib/auth";
import { useLogin } from "../hooks/use-login";
import styles from "./login-form.module.css";

export function RegisterForm() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const { mutate: login } = useLogin();

  const {
    mutate: register,
    isPending,
    error,
  } = useMutation({
    mutationFn: () => auth.register(form),
    onSuccess: () => {
      login({ username: form.username, password: form.password });
    },
  });

  const setField =
    (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = () => {
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      return;
    }

    register();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") handleSubmit();
  };

  return (
    <div className={styles.form}>
      <div className={styles.header}>
        <h1 className={styles.title}>Создать аккаунт</h1>
        <p className={styles.subtitle}>Присоединяйтесь к EduTrack</p>
      </div>

      <div className={styles.fields}>
        <Input
          label="Имя пользователя"
          placeholder="username"
          value={form.username}
          onChange={setField("username")}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={setField("email")}
          onKeyDown={handleKeyDown}
        />
        <Input
          label="Пароль"
          type="password"
          placeholder="минимум 8 символов"
          value={form.password}
          onChange={setField("password")}
          onKeyDown={handleKeyDown}
        />
      </div>

      {error ? (
        <p className={styles.error}>
          Ошибка регистрации. Попробуйте другой email или username.
        </p>
      ) : null}

      <Button
        onClick={handleSubmit}
        loading={isPending}
        className={styles.submit}
        size="lg"
      >
        Зарегистрироваться
      </Button>

      <p className={styles.footer}>
        Уже есть аккаунт?{" "}
        <Link href="/login" className={styles.link}>
          Войти
        </Link>
      </p>
    </div>
  );
}
