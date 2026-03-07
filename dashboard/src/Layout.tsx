import { Link, Outlet } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="text-lg font-semibold">
            Blackbox Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="px-4">
        <Outlet />
      </main>
    </div>
  );
}
