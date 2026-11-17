import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";

export function LoginPage() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isPending && session?.user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const result = await authClient.signIn.email({
      email,
      password,
    });

    setBusy(false);

    if (result.error) {
      setError(result.error.message ?? "Não foi possível entrar.");
      return;
    }

    navigate("/");
  }

  return (
    <div className="mx-auto flex min-h-screen w-[min(480px,calc(100%-32px))] flex-col justify-center py-10">
      <Link
        to="/"
        className="mb-8 font-display text-[25px] font-semibold tracking-[0.12em] text-ink no-underline"
      >
        MEMORIES<span className="text-accent">.</span>
      </Link>
      <h1 className="m-0 mb-2 font-display text-[36px] font-normal">Entrar</h1>
      <p className="mb-6 text-[13px] text-muted">Acesso exclusivo do administrador.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="text-[12px] text-muted">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-full border border-line bg-surface px-4 py-3 text-[14px] text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="text-[12px] text-muted">
          Senha
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-full border border-line bg-surface px-4 py-3 text-[14px] text-ink outline-none focus:border-accent"
          />
        </label>
        {error ? <p className="m-0 text-[12px] text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-2 rounded-full bg-accent px-4 py-3 text-[13px] text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {busy ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
