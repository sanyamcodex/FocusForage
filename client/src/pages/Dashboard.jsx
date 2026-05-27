import { motion } from "framer-motion";
import { Copy, DoorOpen, Flame, Plus, Search, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { StatCard } from "../components/dashboard/StatCard";
import { Button } from "../components/ui/Button";
import { Card, Skeleton } from "../components/ui/Card";
import { Input, Textarea } from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
import { api } from "../lib/api";
import { formatHours } from "../lib/utils";

export function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [dashboard, roomResponse] = await Promise.all([api.get("/dashboard/summary"), api.get("/rooms")]);
      setSummary(dashboard.data);
      setRooms(roomResponse.data.rooms);
    } catch (error) {
      toast(error.message || "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (searchParams.get("create") === "room") setCreateOpen(true);
  }, [searchParams]);

  const filteredRooms = useMemo(
    () => rooms.filter((room) => `${room.name} ${room.subject}`.toLowerCase().includes(query.toLowerCase())),
    [rooms, query]
  );

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Command center</p>
          <h2 className="text-3xl font-semibold">Study dashboard</h2>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Create room</Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32" />)}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-4">
          <StatCard icon={Timer} label="Total study" value={formatHours(summary?.totalStudyHours)} />
          <StatCard icon={DoorOpen} label="Active rooms" value={summary?.activeRooms || 0} />
          <StatCard icon={Flame} label="Current streak" value={`${summary?.streak?.current || 0} days`} />
          <StatCard icon={Flame} label="Best streak" value={`${summary?.streak?.best || 0} days`} />
        </motion.div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search rooms by subject or name" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          {filteredRooms.length === 0 ? (
            <Card className="grid min-h-72 place-items-center text-center">
              <div>
                <p className="text-lg font-semibold">No study rooms yet</p>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">Create a room for NEET, UPSC, coding interviews, or your next exam sprint.</p>
                <Button className="mt-5" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Create first room</Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredRooms.map((room) => <RoomCard key={room._id} room={room} />)}
            </div>
          )}
        </section>
        <Card>
          <p className="mb-4 font-semibold">Weekly focus</p>
          <div className="flex h-52 items-end gap-3">
            {(summary?.weeklyStats || []).map((day) => {
              const max = Math.max(...summary.weeklyStats.map((item) => item.seconds), 1);
              return (
                <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${Math.max(8, (day.seconds / max) * 170)}px` }} />
                  <span className="text-xs text-muted-foreground">{day.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 border-t pt-5">
            <p className="mb-3 text-sm font-medium">Recent activity</p>
            <div className="grid gap-3">
              {(summary?.recentActivity || []).slice(0, 5).map((item) => (
                <p key={item._id} className="text-sm text-muted-foreground">{item.action.replaceAll("_", " ")} in {item.room?.name || "workspace"}</p>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {createOpen && <CreateRoomModal onClose={() => setCreateOpen(false)} onCreated={load} />}
    </div>
  );
}

function RoomCard({ room }) {
  const { toast } = useToast();
  const inviteUrl = `${window.location.origin}/app/join/${room.inviteCode}`;
  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-glow">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{room.subject}</p>
          <h3 className="text-xl font-semibold">{room.name}</h3>
        </div>
        <Button size="icon" variant="ghost" title="Copy invite" onClick={() => navigator.clipboard.writeText(inviteUrl).then(() => toast("Invite link copied"))}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <p className="min-h-10 text-sm text-muted-foreground">{room.description || "A quiet room for focused study sprints."}</p>
      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{room.members?.filter((item) => item.status === "active").length || 1} members</span>
        <Button size="sm"><Link to={`/app/rooms/${room._id}`}>Open room</Link></Button>
      </div>
    </Card>
  );
}

function CreateRoomModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", subject: "", description: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/rooms", form);
      toast("Room created");
      onClose();
      onCreated();
    } catch (error) {
      toast(error.message || "Could not create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-glow">
        <h3 className="text-2xl font-semibold">Create study room</h3>
        <div className="mt-6 grid gap-4">
          <Input required placeholder="Room name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <Textarea placeholder="What will this group focus on?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={loading}>{loading ? "Creating..." : "Create room"}</Button>
        </div>
      </form>
    </div>
  );
}

