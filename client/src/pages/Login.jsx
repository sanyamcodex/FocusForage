import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate("/app");
    } catch (error) {
      toast(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame title="Welcome back" copy="Join your rooms, resume your timer, and keep the streak alive.">
      <form onSubmit={submit} className="grid gap-4">
        <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button disabled={loading}>{loading ? "Signing in..." : "Login"}</Button>
      </form>
      <p className="mt-5 text-sm text-muted-foreground">No account? <Link className="text-primary" to="/register">Create one</Link></p>
    </AuthFrame>
  );
}

export function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await register(form);
      navigate("/app");
    } catch (error) {
      toast(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame title="Create your study command center" copy="Launch a private room, invite peers, and build a visible preparation rhythm.">
      <form onSubmit={submit} className="grid gap-4">
        <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input type="password" placeholder="Password, minimum 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
      </form>
      <p className="mt-5 text-sm text-muted-foreground">Already registered? <Link className="text-primary" to="/login">Login</Link></p>
    </AuthFrame>
  );
}

function AuthFrame({ title, copy, children }) {
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-md rounded-lg border bg-card p-7 shadow-glow">
        <Link to="/" className="mb-8 block text-lg font-semibold">FocusForge</Link>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mb-7 mt-2 text-muted-foreground">{copy}</p>
        {children}
      </div>
    </div>
  );
}

