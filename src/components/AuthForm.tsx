"use client";
import { useState } from "react";
import Link from "next/link";
import { errorMessage } from "@/lib/client-api";

type Credentials = { username: string; password: string };

function send(path: "login" | "register", credentials: Credentials) {
  return fetch(`/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isLogin = mode === "login";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const credentials = {
      username: String(form.get("username")),
      password: String(form.get("password")),
    };

    try {
      let res = await send(mode, credentials);
      // register, then log in with the same credentials
      if (res.ok && mode === "register") res = await send("login", credentials);

      if (!res.ok) {
        setError(await errorMessage(res));
        setPending(false);
        return;
      }
      window.location.assign("/game"); // pending stays true until the page unloads
    } catch {
      setError("Could not reach the server");
      setPending(false);
    }
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
