import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type Entry = { id: string; date: string; desc: string; amount: string; resolved?: boolean }

const ledger: Entry[] = [
  { id: "l1", date: "2025-02-18", desc: "RCRD 02/18/2025 MCGH FUNDING/ACTUAL JAN OPEX PAYABLES", amount: "-US$44,648.00" },
  { id: "l2", date: "2025-02-19", desc: "Dominion Energy (v0000025)", amount: "+US$441.60" },

  { id: "l3", date: "2025-02-20", desc: "Beacon Technologies Inc (v0000003)", amount: "+US$184.73" },
  { id: "l4", date: "2025-02-20", desc: "Realpage Inc (v0000004)", amount: "+US$5.73" },
  { id: "l5", date: "2025-02-20", desc: "Realpage Inc (v0000004)", amount: "+US$194.76" },
  { id: "l6", date: "2025-02-20", desc: "Aire Master of Charleston (v0000010)", amount: "+US$61.50" },
  { id: "l7", date: "2025-02-20", desc: "Aire Master of Charleston (v0000010)", amount: "+US$61.50" },
  { id: "l8", date: "2025-02-20", desc: "Jonah Systems LLC (v0000012)", amount: "+US$185.00" },
  { id: "l9", date: "2025-02-20", desc: "The Vernon Company (v0000027)", amount: "+US$401.20" },
  { id: "l10", date: "2025-02-20", desc: "Madison Communities LLC (v0000065)", amount: "+US$2,611.70" },
  { id: "l11", date: "2025-02-20", desc: "Madison Communities LLC (v0000065)", amount: "+US$3,787.28" },
  { id: "l12", date: "2025-02-20", desc: "Madison Communities LLC (v0000065)", amount: "+US$177.82" },
  { id: "l13", date: "2025-02-20", desc: "Madison Communities LLC (v0000065)", amount: "+US$14.94" },
  { id: "l14", date: "2025-02-20", desc: "Madison Communities LLC (v0000065)", amount: "+US$3.36" },
];

const bank: Entry[] = [
  { id: "b1", date: "2025-01-03", desc: "Charleston Water System (v0000024)", amount: "+US$17.50" },
  { id: "b2", date: "2025-01-03", desc: "Charleston Water System (v0000024)", amount: "+US$1183.70" },
  { id: "b3", date: "2025-01-07", desc: "AT&T -5014 (v0000031)", amount: "+US$119.28" },
  { id: "b4", date: "2025-01-07", desc: "AT&T -5014 (v0000031)", amount: "+US$148.95" },
  { id: "b5", date: "2025-01-09", desc: "Beacon Technologies Inc (v0000003)", amount: "+US$114.00" },
  { id: "b6", date: "2025-01-09", desc: "Realpage Inc (v0000004)", amount: "+US$211.95" },
  { id: "b7", date: "2025-01-09", desc: "Jonah Systems LLC (v0000012)", amount: "+US$185.00" },
  { id: "b8", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$3000.00" },
  { id: "b9", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$31.00" },
  { id: "b10", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$164.78" },
  { id: "b11", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$111.32" },
  { id: "b12", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$74.68" },
  { id: "b13", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$3.53" },
  { id: "b14", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$15.93" },
  { id: "b15", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$67.68" },
  { id: "b16", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$200.00" },
  { id: "b17", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$17.61" },
  { id: "b18", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$165.60" },
  { id: "b19", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$252.80" },
  { id: "b20", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$144.04" },
  { id: "b21", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$311.35" },
  { id: "b22", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$12.00" },
  { id: "b23", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$51.30" },
  { id: "b24", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$27.00" },
  { id: "b25", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$145.36" },
  { id: "b26", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$228.40" },
  { id: "b27", date: "2025-01-09", desc: "Madison Communities LLC (v0000065)", amount: "+US$115.31" }
];


const Reconciliation = () => {
  const [state, setState] = useState({ ledger, bank })

  const toggleResolved = (id: string, type: "ledger" | "bank") => {
    setState((prev) => ({
      ...prev,
      [type]: prev[type].map((e) => (e.id === id ? { ...e, resolved: !e.resolved } : e)),
    }))
  }

  const isMatch = (l: Entry) => bank.some(b => b.desc === l.desc && b.amount === l.amount && b.date === l.date)

  return (
    <AppLayout title="Reconciliation">
      <div className="grid gap-4 grid-rows-2">
        <Card>
          <CardHeader><CardTitle>Ledger</CardTitle></CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.ledger.map(l => (
                    <TableRow key={l.id} className={!isMatch(l) ? "bg-secondary/40" : "bg-accent/10"}>
                      <TableCell>{l.date}</TableCell>
                      <TableCell>{l.desc}</TableCell>
                      <TableCell className="text-right">{l.amount}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => toggleResolved(l.id, "ledger")}>{l.resolved ? "Resolved" : "Mark Resolved"}</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Bank</CardTitle></CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.bank.map(b => (
                    <TableRow key={b.id}>
                      <TableCell>{b.date}</TableCell>
                      <TableCell>{b.desc}</TableCell>
                      <TableCell className="text-right">{b.amount}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => toggleResolved(b.id, "bank")}>{b.resolved ? "Resolved" : "Mark Resolved"}</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default Reconciliation
