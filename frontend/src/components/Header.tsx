import { Link } from "react-router-dom";
import { authClient } from "../lib/auth-client";

type HeaderProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  isAdmin: boolean;
};

export function Header({ theme, onToggleTheme, isAdmin }: HeaderProps) {
  async function handleSignOut() {
    await authClient.signOut();
  }

  return (
    <header className="flex min-h-[82px] items-center justify-between gap-4 border-b border-line">
      <Link
        to="/"
        className="font-display text-[25px] font-semibold tracking-[0.12em] text-ink no-underline"
      >
        MEMORIES<span className="text-accent">.</span>
      </Link>
      <div className="flex items-center gap-4">
        <div className="hidden text-[12px] tracking-[0.08em] text-muted uppercase sm:block">
          A collection of moments
        </div>
        {isAdmin ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full border border-line bg-surface px-3 py-2 text-[12px] text-ink"
          >
            Sair
          </button>
        ) : (
          <Link
            to="/login"
            className="rounded-full border border-line bg-surface px-3 py-2 text-[12px] text-ink no-underline"
          >
            Admin
          </Link>
        )}
        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-full border border-line bg-surface px-3 py-2 text-[12px] text-ink"
        >
          {theme === "dark" ? "☀ Light Mode" : "☾ Dark Mode"}
        </button>
      </div>
    </header>
  );
}
