import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

const accounts = [
  { id: "acc-001", name: "Chase Checking ****1234" },
  { id: "acc-002", name: "Wells Fargo Savings ****9876" },
]

const entities = [
  { id: "ent-a", name: "Alpha Holdings", subs: [ { id: "sub-a1", name: "Property A" }, { id: "sub-a2", name: "Property B" } ] },
  { id: "ent-b", name: "Beta Estates", subs: [ { id: "sub-b1", name: "Property C" } ] },
]

type Mapping = { accountId: string; entityId?: string; subId?: string }

const BankMapping = () => {
  const { toast } = useToast()
  const [mappings, setMappings] = useState<Mapping[]>(accounts.map(a => ({ accountId: a.id })))

  const updateMapping = (idx: number, patch: Partial<Mapping>) => {
    setMappings((prev) => prev.map((m, i) => i === idx ? { ...m, ...patch, ...(patch.entityId ? { subId: undefined } : {}) } : m))
  }

  const handleSave = () => {
    toast({ title: "Mappings saved (demo)", description: `${mappings.length} accounts mapped.` })
  }

  return (
    <AppLayout title="Bank Account Mapping">
      <section className="grid gap-4 md:grid-cols-2">
        {accounts.map((acc, idx) => {
          const mapping = mappings[idx]
          const selectedEntity = entities.find(e => e.id === mapping.entityId)
          return (
            <Card key={acc.id}>
              <CardHeader>
                <CardTitle>{acc.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Entity</label>
                  <Select value={mapping.entityId} onValueChange={(v) => updateMapping(idx, { entityId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select entity" /></SelectTrigger>
                    <SelectContent>
                      {entities.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Sub-Entity</label>
                  <Select value={mapping.subId} onValueChange={(v) => updateMapping(idx, { subId: v })} disabled={!selectedEntity}>
                    <SelectTrigger><SelectValue placeholder="Select sub-entity" /></SelectTrigger>
                    <SelectContent>
                      {selectedEntity?.subs.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>
      <div className="mt-4">
        <Button onClick={handleSave}>Save Mappings</Button>
      </div>
    </AppLayout>
  )
}

export default BankMapping
