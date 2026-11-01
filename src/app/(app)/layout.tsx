import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <>
      <nav className="nav">
        <Link className="link" href="/game">
          Game
        </Link>
        <Link className="link" href="/leaderboard">
          Leaderboard
        </Link>
        <span className="nav-spacer">{user.username}</span>
        <LogoutButton />
      </nav>
      {children}
    </>
  );
}
