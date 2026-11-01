"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isLogin = mode === "login";

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.message ?? "Something went wrong");
      setPending(false);
      return;
    }
    router.replace("/game");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="form">
      <h1 className="title">{isLogin ? "Login" : "Register"}</h1>
      <input className="input" name="username" placeholder="Username" required minLength={3} autoComplete="username" />
      <input
        className="input"
        name="password"
        type="password"
        placeholder="Password"
        required
        minLength={8}
        autoComplete={isLogin ? "current-password" : "new-password"}
      />
      {error && <p className="error">{error}</p>}
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "..." : isLogin ? "Login" : "Create account"}
      </button>
      <Link className="link" href={isLogin ? "/register" : "/login"}>
        {isLogin ? "No account? Register" : "Have an account? Login"}
      </Link>
    </form>
  );
}
