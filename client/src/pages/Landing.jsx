import { motion } from "framer-motion";
import { ArrowRight, BarChart3, MessageSquare, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6">
        <Link to="/" className="text-lg font-semibold">FocusForge</Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Login</Link>
          <Button as="span" size="sm" onClick={() => {}}>
            <Link to="/register" className="flex items-center gap-2">Start free <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-10 px-5 pb-10 lg:grid-cols-[1fr_0.9fr]">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="mb-4 inline-flex rounded-full border px-3 py-1 text-sm text-muted-foreground">Realtime study rooms for exam teams</p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-normal md:text-7xl">
            FocusForge
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            A polished workspace where students prep together with live presence, room chat, Pomodoro sessions, streaks, and study analytics.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button>
              <Link to="/register" className="flex items-center gap-2">Create workspace <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button variant="outline">
              <Link to="/login">Open dashboard</Link>
            </Button>
          </div>
        </motion.section>
        <motion.section
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="glass rounded-lg border p-4 shadow-glow"
        >
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AIIMS Final Revision</p>
                <h2 className="text-2xl font-semibold">Deep Work Room</h2>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-500">12 online</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["03:42:18", "Focused today", Timer],
                ["248", "Messages", MessageSquare],
                ["91%", "Weekly goal", BarChart3]
              ].map(([value, label, Icon]) => (
                <div key={label} className="rounded-lg border bg-background p-4">
                  <Icon className="mb-4 h-5 w-5 text-primary" />
                  <p className="text-2xl font-semibold">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-medium">Room chat</p>
                <p className="text-xs text-muted-foreground">Typing...</p>
              </div>
              <div className="grid gap-3 text-sm">
                <p className="rounded-md bg-muted p-3">Riya: Starting endocrine revision at 8. Join the timer?</p>
                <p className="rounded-md bg-primary p-3 text-primary-foreground">You: In. Sharing my notes after this sprint.</p>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

