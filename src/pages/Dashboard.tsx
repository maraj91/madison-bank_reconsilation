import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const data = [
  { month: "Jan", pl: 12000 },
  { month: "Feb", pl: 9000 },
  { month: "Mar", pl: 15000 },
  { month: "Apr", pl: 8000 },
  { month: "May", pl: 18000 },
  { month: "Jun", pl: 22000 },
]

const totalPL = data.reduce((s, d) => s + d.pl, 0)

const Dashboard = () => {
  return (
    <AppLayout title="Dashboard">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Profit & Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${(totalPL / 1000).toFixed(1)}k</div>
            <p className="text-sm text-muted-foreground">Across all properties (demo)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Best Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Jun</div>
            <p className="text-sm text-muted-foreground">$22k P/L</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Worst Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Apr</div>
            <p className="text-sm text-muted-foreground">$8k P/L</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Profit/Loss Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="pl" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  )
}

export default Dashboard
