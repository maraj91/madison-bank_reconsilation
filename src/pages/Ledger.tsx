import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useRef, useState } from "react"
import { Upload } from "lucide-react"
import * as XLSX from "xlsx"

type Row = {
  date: string
  description: string
  reference: string
  amount: number
  status: "not-found" | "match" | "mismatch"
}

const DropZone = ({ label, onFiles, selectedFiles, accept }: { label: string; onFiles: (files: FileList) => void; selectedFiles?: File[]; accept?: string }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files)
      }}
      className="border border-dashed rounded-md p-6 text-center hover:bg-muted/30 transition"
    >
      <Upload className="mx-auto mb-2 h-5 w-5" />
      <p className="text-sm mb-2">{label}</p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />
      <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>Browse</Button>
      {selectedFiles && selectedFiles.length > 0 ? (
        <ul className="mt-2 text-xs text-muted-foreground text-left inline-block">
          {selectedFiles.map((f) => (
            <li key={f.name}>{f.name}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

const StatusPill = ({ s }: { s: Row["status"] }) => {
  const map: Record<Row["status"], string> = {
    match: "bg-green-100 text-green-800",
    mismatch: "bg-yellow-100 text-yellow-800",
    "not-found": "bg-red-100 text-red-700",
  }
  const label = s === "match" ? "Exact Match" : s === "mismatch" ? "Mismatch" : "Not Found"
  return <span className={`px-2 py-1 rounded text-xs ${map[s]}`}>{label}</span>
}

function excelSerialDateToJSDate(serial: number): Date {
  // Excel epoch: 1899-12-30
  const utcDays = Math.floor(serial - 25569)
  const utcValue = utcDays * 86400
  const dateInfo = new Date(utcValue * 1000)
  const fractionalDay = serial - Math.floor(serial) + 1e-7
  let totalSeconds = Math.floor(86400 * fractionalDay)
  const seconds = totalSeconds % 60
  totalSeconds -= seconds
  const hours = Math.floor(totalSeconds / (60 * 60))
  const minutes = Math.floor(totalSeconds / 60) % 60
  dateInfo.setUTCHours(hours)
  dateInfo.setUTCMinutes(minutes)
  dateInfo.setUTCSeconds(seconds)
  return dateInfo
}

function toYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function tryParseDate(cell: unknown): string | null {
  if (cell == null || cell === "") return null
  if (typeof cell === "number") {
    try {
      return toYMD(excelSerialDateToJSDate(cell))
    } catch {
      return null
    }
  }
  if (typeof cell === "string") {
    const parsed = new Date(cell)
    if (!isNaN(parsed.getTime())) return toYMD(parsed)
  }
  if (cell instanceof Date) {
    return toYMD(cell)
  }
  return null
}

function toNumber(n: unknown): number | null {
  if (n == null || n === "") return null
  if (typeof n === "number" && isFinite(n)) return n
  if (typeof n === "string") {
    const cleaned = n.replace(/[\,\s]/g, "")
    const val = Number(cleaned)
    return isNaN(val) ? null : val
  }
  return null
}

async function parseSheetAsRows(file: File): Promise<any[][]> {
  const arrayBuffer = await file.arrayBuffer()
  const wb = XLSX.read(arrayBuffer, { type: "array" })
  const firstSheetName = wb.SheetNames[0]
  const sheet = wb.Sheets[firstSheetName]
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: "" }) as any[][]
  return rows
}

async function parseLedger(file: File): Promise<Row[]> {
  const matrix = await parseSheetAsRows(file)
  // Assume first row is header
  const dataRows = matrix.slice(1)
  const F = 5, H = 7, J = 9, K = 10, L = 11
  const parsed: Row[] = []
  let started = false
  for (const r of dataRows) {
    const dateStr = tryParseDate(r[F])
    // Skip leading rows until a valid date appears
    if (!started && !dateStr) continue
    if (!started && dateStr) started = true

    const description = String(r[H] ?? "").trim()
    const reference = String(r[J] ?? "").trim()
    const debit = toNumber(r[K]) ?? 0
    const credit = toNumber(r[L]) ?? 0
    const amount = credit - debit
    if (amount === 0) continue
    const isEmpty = !dateStr && !description && !reference
    if (isEmpty) continue
    parsed.push({
      date: dateStr ?? "",
      description,
      reference,
      amount,
      status: "not-found",
    })
  }
  return parsed
}

type BankTxn = { date: string; amount: number; payee: string }

async function parseBank(file: File): Promise<BankTxn[]> {
  const matrix = await parseSheetAsRows(file)
  if (matrix.length === 0) return []

  // Prefer fixed column positions: B(date)=1, D(payee)=3, G(amount)=6
  const B = 1, D = 3, G = 6
  const body = matrix.slice(1)
  let fixedDetected = false
  for (let i = 0; i < Math.min(5, body.length); i++) {
    const r = body[i]
    if (r && (r[B] !== undefined || r[D] !== undefined || r[G] !== undefined)) {
      fixedDetected = true
      break
    }
  }

  const results: BankTxn[] = []

  if (fixedDetected) {
    for (const r of body) {
      const dateStr = tryParseDate(r[B])
      const payee = String(r[D] ?? "").trim()
      const amt = toNumber(r[G])
      if (!dateStr) continue
      if (amt == null) continue
      const amount = Math.abs(amt)
      if (amount === 0) continue
      results.push({ date: dateStr, amount, payee })
    }
    return results
  }

  // Fallback: header-based detection
  const header = matrix[0].map((h) => String(h).toLowerCase())
  let dateIdx = header.findIndex((h) => ["date", "transaction date", "posting date"].includes(h))
  const payeeIdx = header.findIndex((h) => ["payee", "description", "name"].includes(h))
  let amountIdx = header.findIndex((h) => ["amount", "amt"].includes(h))
  let debitIdx = header.findIndex((h) => ["debit", "withdrawal"].includes(h))
  let creditIdx = header.findIndex((h) => ["credit", "deposit"].includes(h))

  const dataRows = matrix.slice(1)

  if (dateIdx === -1) dateIdx = 0
  const lastRow = matrix[matrix.length - 1]
  if (amountIdx === -1 && debitIdx === -1 && creditIdx === -1) amountIdx = Math.max(1, (lastRow?.length ?? 2) - 1)

  for (const r of dataRows) {
    const dateStr = tryParseDate(r[dateIdx])
    if (!dateStr) continue

    let amount = 0
    if (amountIdx !== -1) {
      const a = toNumber(r[amountIdx])
      if (a == null) continue
      amount = Math.abs(a)
    } else {
      const d = Math.abs(toNumber(r[debitIdx]) ?? 0)
      const c = Math.abs(toNumber(r[creditIdx]) ?? 0)
      amount = c || d
      if (amount === 0) continue
    }

    const payee = String(r[payeeIdx] ?? "").trim()
    results.push({ date: dateStr, amount, payee })
  }

  return results
}

function computeStatuses(ledger: Row[], bank: BankTxn[]): Row[] {
  const used = new Array(bank.length).fill(false)
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim()

  return ledger.map((row) => {
    const targetVal = Math.abs(row.amount)
    const rowDesc = normalize(row.description)

    // 1) Try strict match: date + amount (ignoring sign)
    let matchIdx = bank.findIndex((b, i) => !used[i] && b.date === row.date && b.amount === targetVal)
    if (matchIdx !== -1) {
      used[matchIdx] = true
      return { ...row, status: "match" }
    }

    // 2) Try payee + amount match (date optional)
    matchIdx = bank.findIndex((b, i) => !used[i] && b.payee && rowDesc.includes(normalize(b.payee)) && b.amount === targetVal)
    if (matchIdx !== -1) {
      used[matchIdx] = true
      return { ...row, status: "match" }
    }

    // 3) If any statement exists with the same date but different amount/details, mark mismatch; else not-found
    const hasSameDate = bank.some((b, i) => !used[i] && b.date === row.date)
    if (hasSameDate) return { ...row, status: "mismatch" }

    return { ...row, status: "not-found" }
  })
}

const Ledger = () => {
  const [rows, setRows] = useState<Row[]>([])
  const [ledgerFiles, setLedgerFiles] = useState<File[]>([])
  const [bankFiles, setBankFiles] = useState<File[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 100

  const handleLedgerFiles = async (files: FileList) => {
    const selected = Array.from(files)
    if (selected.length === 0) return
    setLedgerFiles(selected)
    try {
      const parsed = await parseLedger(selected[0])
      setRows(parsed)
      setCurrentPage(1)
    } catch (e) {
      console.error(e)
      window.alert("Failed to parse ledger file. Please upload .xlsx, .xls, or .csv with expected columns (F,H,J,K/L).")
    }
  }
  const handleBankFiles = async (files: FileList) => {
    const selected = Array.from(files)
    if (selected.length === 0) return
    setBankFiles(selected)
    try {
      const bankTxns = await parseBank(selected[0])
      setRows((prev) => computeStatuses(prev, bankTxns))
      setCurrentPage(1)
    } catch (e) {
      console.error(e)
      window.alert("Failed to parse bank statement. Please upload .xlsx, .xls, or .csv with Date and Amount or Debit/Credit columns.")
    }
  }

  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const pageRows = rows.slice(start, end)

  return (
    <AppLayout title="Ledger Upload & Reconciliation">
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload Ledger (Excel)</CardTitle>
          </CardHeader>
          <CardContent>
            <DropZone label="Drag & drop or browse your ledger file" onFiles={handleLedgerFiles} selectedFiles={ledgerFiles} accept=".xlsx,.xls,.csv" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upload Bank Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <DropZone label="Drag & drop or browse your bank statement" onFiles={handleBankFiles} selectedFiles={bankFiles} accept=".csv,.xlsx,.xls" />
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 text-sm mb-3">
              <span className="px-2 py-1 rounded bg-green-100 text-green-800">Green = Match</span>
              <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">Yellow = Mismatch</span>
              <span className="px-2 py-1 rounded bg-red-100 text-red-700">Red = Not Found</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Person/Description Control</TableHead>
                  <TableHead>Reference No.</TableHead>
                  <TableHead className="text-right">Debit/Credit (+/-)</TableHead>
                  <TableHead>Match Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((r, i) => (
                  <TableRow
                    key={i}
                    className={
                      r.status === "not-found"
                        ? "bg-red-50"
                        : r.status === "mismatch"
                        ? "bg-yellow-50"
                        : "bg-green-50"
                    }
                  >
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell>{r.reference}</TableCell>
                    <TableCell className="text-right">{`${r.amount > 0 ? "+" : "-"}${Math.abs(r.amount).toLocaleString(undefined, { style: "currency", currency: "USD" })}`}</TableCell>
                    <TableCell><StatusPill s={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4 text-sm">
              <div>
                Showing {rows.length === 0 ? 0 : start + 1}-{Math.min(end, rows.length)} of {rows.length}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Previous</Button>
                <span className="px-2 py-1">Page {currentPage} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
              </div>
            </div>
            {rows.length === 0 ? (
              <div className="text-sm text-muted-foreground mt-2">No ledger data yet. Upload a ledger file to see entries.</div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  )
}

export default Ledger
