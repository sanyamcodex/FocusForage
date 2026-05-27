import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Textarea } from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    timezone: user?.timezone || "Asia/Calcutta",
    studyGoalHours: user?.studyGoalHours || 20
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await api.patch("/users/me", form);
      setUser(response.data.user);
      toast("Profile updated");
    } catch (error) {
      toast(error.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl p-4 lg:p-8">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Personal workspace</p>
        <h2 className="text-3xl font-semibold">Profile</h2>
      </div>
      <Card>
        <form onSubmit={submit} className="grid gap-5">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Timezone</label>
              <Input value={form.timezone} onChange={(event) => setForm({ ...form, timezone: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Weekly study goal</label>
              <Input type="number" value={form.studyGoalHours} onChange={(event) => setForm({ ...form, studyGoalHours: event.target.value })} />
            </div>
          </div>
          <Button className="w-fit" disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save profile"}</Button>
        </form>
      </Card>
    </div>
  );
}

