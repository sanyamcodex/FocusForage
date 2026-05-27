import { AnimatePresence, motion } from "framer-motion";
import { Copy, DoorOpen, Pause, Play, Send, Square, Timer, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, Skeleton } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
import { useSocket } from "../hooks/useSocket";
import { api } from "../lib/api";
import { formatTimer } from "../lib/utils";

export function Room() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [presence, setPresence] = useState([]);
  const [typing, setTyping] = useState(null);
  const [session, setSession] = useState(null);
  const [remaining, setRemaining] = useState(1500);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { toast } = useToast();
  const bottomRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [roomResponse, messageResponse] = await Promise.all([api.get(`/rooms/${roomId}`), api.get(`/rooms/${roomId}/messages`)]);
        setRoom(roomResponse.data.room);
        setSession(roomResponse.data.room.activeSession);
        setRemaining(roomResponse.data.room.activeSession?.remainingSeconds || 1500);
        setMessages(messageResponse.data.messages);
      } catch (error) {
        toast(error.message || "Could not load room");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [roomId]);

  useEffect(() => {
    if (!socket || !roomId) return undefined;
    socket.emit("room:join", { roomId });
    socket.on("presence:update", setPresence);
    socket.on("chat:new", (message) => setMessages((items) => [...items, message]));
    socket.on("chat:typing", (payload) => {
      setTyping(payload.isTyping ? payload.name : null);
      setTimeout(() => setTyping(null), 1800);
    });
    socket.on("room:notification", (payload) => toast(payload.message));
    socket.on("session:update", (payload) => {
      setSession(payload);
      setRemaining(payload.remainingSeconds);
    });
    return () => {
      socket.emit("room:leave", { roomId });
      socket.off("presence:update");
      socket.off("chat:new");
      socket.off("chat:typing");
      socket.off("room:notification");
      socket.off("session:update");
    };
  }, [socket, roomId]);

  useEffect(() => {
    if (!session || session.status !== "running") return undefined;
    const id = setInterval(() => {
      setRemaining((value) => {
        const next = Math.max(0, value - 1);
        if (next === 0) endSession(0);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [session?.status, session?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const inviteUrl = room ? `${window.location.origin}/app/join/${room.inviteCode}` : "";

  const startSession = async () => {
    try {
      const response = await api.post(`/sessions/${roomId}/start`, { durationSeconds: 1500, mode: "pomodoro" });
      setSession(response.data.session);
      setRemaining(response.data.session.remainingSeconds);
      socket?.emit("session:update", { roomId, session: response.data.session });
    } catch (error) {
      toast(error.message || "Could not start session");
    }
  };

  const pauseSession = async () => {
    const response = await api.post(`/sessions/${session._id}/pause`);
    const updated = { ...response.data.session, remainingSeconds: remaining };
    setSession(updated);
    socket?.emit("session:update", { roomId, session: updated });
  };

  const resumeSession = async () => {
    const response = await api.post(`/sessions/${session._id}/resume`);
    const updated = { ...response.data.session, remainingSeconds: remaining };
    setSession(updated);
    socket?.emit("session:update", { roomId, session: updated });
  };

  const endSession = async (overrideRemaining = remaining) => {
    if (!session?._id) return;
    const response = await api.post(`/sessions/${session._id}/end`, { remainingSeconds: overrideRemaining });
    const updated = response.data.session;
    setSession(updated);
    socket?.emit("session:update", { roomId, session: updated });
  };

  if (loading) {
    return <div className="grid gap-4 p-4 lg:p-8"><Skeleton className="h-32" /><Skeleton className="h-[560px]" /></div>;
  }

  return (
    <div className="grid min-h-[calc(100vh-64px)] gap-4 p-4 lg:grid-cols-[1fr_340px] lg:p-8">
      <section className="grid min-h-[720px] grid-rows-[auto_1fr_auto] rounded-lg border bg-card">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div>
            <p className="text-sm text-muted-foreground">{room.subject}</p>
            <h2 className="text-2xl font-semibold">{room.name}</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(inviteUrl).then(() => toast("Invite link copied"))}>
              <Copy className="h-4 w-4" /> Invite
            </Button>
            <Button variant="ghost"><Link to="/app">Dashboard</Link></Button>
          </div>
        </header>

        <div className="scrollbar-thin overflow-y-auto p-5">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div key={message._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted text-sm font-semibold">
                  {message.sender?.name?.[0] || "S"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{message.sender?.name || "System"}</p>
                    <span className="text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="mt-1 rounded-lg bg-background px-4 py-3 text-sm">{message.body}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        <ChatBox roomId={roomId} socket={socket} />
      </section>

      <aside className="grid content-start gap-4">
        <TimerPanel
          session={session}
          remaining={remaining}
          onStart={startSession}
          onPause={pauseSession}
          onResume={resumeSession}
          onEnd={() => endSession()}
        />
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <p className="font-semibold">Live presence</p>
          </div>
          <div className="grid gap-3">
            {presence.length === 0 ? (
              <p className="text-sm text-muted-foreground">Presence appears when teammates join this room.</p>
            ) : (
              presence.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <p className="text-sm">{user.name}</p>
                </div>
              ))
            )}
          </div>
          {typing && <p className="mt-5 text-sm text-muted-foreground">{typing} is typing...</p>}
        </Card>
        <Card>
          <p className="mb-2 font-semibold">Focus mode</p>
          <p className="text-sm text-muted-foreground">Keep chat visible, mute visual noise, and let the shared timer anchor the room.</p>
        </Card>
      </aside>
    </div>
  );
}

function ChatBox({ roomId, socket }) {
  const [body, setBody] = useState("");
  const { toast } = useToast();

  const submit = async (event) => {
    event.preventDefault();
    if (!body.trim()) return;
    const messageBody = body.trim();
    setBody("");
    socket?.emit("chat:send", { roomId, body: messageBody }, (ack) => {
      if (!ack?.ok) toast(ack?.message || "Message failed");
    });
  };

  return (
    <form onSubmit={submit} className="flex gap-3 border-t p-4">
      <Input
        placeholder="Share a doubt, note, or sprint update..."
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
          socket?.emit("chat:typing", { roomId, isTyping: Boolean(event.target.value) });
        }}
      />
      <Button size="icon" title="Send"><Send className="h-4 w-4" /></Button>
    </form>
  );
}

function TimerPanel({ session, remaining, onStart, onPause, onResume, onEnd }) {
  const progress = useMemo(() => {
    const duration = session?.durationSeconds || 1500;
    return 100 - (remaining / duration) * 100;
  }, [remaining, session]);

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Timer className="h-4 w-4 text-primary" />
        <p className="font-semibold">Synced Pomodoro</p>
      </div>
      <div className="grid place-items-center py-6">
        <div className="relative grid h-48 w-48 place-items-center rounded-full border bg-background">
          <div className="absolute inset-3 rounded-full border-8 border-muted" />
          <div className="absolute inset-3 rounded-full border-8 border-primary" style={{ clipPath: `inset(${100 - progress}% 0 0 0)` }} />
          <p className="relative text-4xl font-semibold">{formatTimer(remaining)}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {!session || session.status === "ended" ? (
          <Button className="col-span-2" onClick={onStart}><Play className="h-4 w-4" /> Start sprint</Button>
        ) : session.status === "paused" ? (
          <Button onClick={onResume}><Play className="h-4 w-4" /> Resume</Button>
        ) : (
          <Button onClick={onPause}><Pause className="h-4 w-4" /> Pause</Button>
        )}
        {session && session.status !== "ended" && (
          <Button variant="outline" onClick={onEnd}><Square className="h-4 w-4" /> End</Button>
        )}
      </div>
    </Card>
  );
}

export function JoinRoom() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    api
      .post(`/rooms/join/${inviteCode}`)
      .then((response) => navigate(`/app/rooms/${response.data.room._id}`))
      .catch((error) => {
        toast(error.message || "Invite link failed");
        navigate("/app");
      });
  }, [inviteCode]);

  return <div className="grid min-h-[60vh] place-items-center text-muted-foreground"><DoorOpen className="mr-2 inline h-4 w-4" /> Joining room...</div>;
}

