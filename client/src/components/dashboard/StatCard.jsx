import { Card } from "../ui/Card";

export function StatCard({ icon: Icon, label, value }) {
  return (
    <Card>
      <Icon className="mb-5 h-5 w-5 text-primary" />
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}

