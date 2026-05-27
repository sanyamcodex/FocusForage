import { BookOpen, LayoutDashboard, LogOut, Moon, Plus, Sun, UserRound } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../ui/Button";

const navItems = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/profile", label: "Profile", icon: UserRound }
];

export function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-card/80 p-5 backdrop-blur-xl lg:block">
        <Link to="/app" className="mb-8 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">FocusForge</p>
            <p className="text-xs text-muted-foreground">Study rooms for serious prep</p>
          </div>
        </Link>
        <nav className="grid gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 grid gap-3">
          <Button variant="outline" onClick={() => navigate("/app?create=room")}>
            <Plus className="h-4 w-4" /> New room
          </Button>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={logout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur lg:ml-72 lg:px-8">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="font-semibold">{user?.name}</h1>
        </div>
        <Button size="icon" variant="outline" onClick={toggleTheme} title="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>
      <main className="lg:ml-72">
        <Outlet />
      </main>
    </div>
  );
}

