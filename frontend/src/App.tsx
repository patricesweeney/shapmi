import { useMemo, useState } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { motion } from 'framer-motion'

type Contribution = { feature: string; value: number }

function Onboarding() {
  const [file, setFile] = useState<File | null>(null)
  const [columns, setColumns] = useState<string[]>([])
  const [target, setTarget] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    target: string
    total_mi: number
    contributions: Contribution[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canAnalyze = useMemo(() => !!file && !!target, [file, target])

  const navigate = useNavigate()

  async function handleFileChange(f: File) {
    setFile(f)
    setError(null)
    setResult(null)
    setTarget('')
    const form = new FormData()
    form.append('file', f)
    const res = await fetch('/api/columns', { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) {
      setError(data?.error || 'Failed to read columns')
      setColumns([])
      return
    }
    setColumns(data.columns || [])
  }

  async function analyze() {
    if (!file || !target) return
    setLoading(true)
    setError(null)
    setResult(null)
    const form = new FormData()
    form.append('file', file)
    form.append('target', target)
    const res = await fetch('/api/mi/shapley', { method: 'POST', body: form })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data?.error || 'Failed to analyze')
      return
    }
    setResult(data)
    // Navigate to analyze page with result in state
    navigate('/analyze', { state: { result: data } })
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-normal ease-standard">
      <div className="h-14 border-b flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded bg-black" />
          <span className="font-semibold tracking-tight">Shapmi</span>
        </div>
      </div>
      <main className="px-6 py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <div className="h-8 w-8 rounded bg-black" />
              <h1 className="text-3xl font-semibold tracking-tight">Upload a dataset to begin analysis</h1>
            </div>
            <p className="text-muted-foreground">CSV or Excel formats supported</p>
          </div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
            <Card>
              <CardHeader>
                <CardTitle>Step 1 – Upload Data</CardTitle>
                <CardDescription>1. Upload dataset → 2. Select target → 3. View decomposition.</CardDescription>
              </CardHeader>
              <CardContent>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-normal ease-standard hover:bg-muted"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const f = e.dataTransfer.files?.[0]
                  if (f) void handleFileChange(f)
                }}
              >
                <input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void handleFileChange(f)
                  }}
                />
                <label htmlFor="file">
                  <Button className="transition-colors duration-normal ease-standard" disabled={loading}>
                    {loading ? 'Loading…' : 'Select File'}
                  </Button>
                </label>
                <div className="mt-2 text-xs text-muted-foreground">Example: data.csv (≤ 5 MB)</div>
                {file && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded border px-2 py-1 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-green-600"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.9a.75.75 0 1 0-1.22-.9l-3.236 4.384-1.56-1.56a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.746-5.14Z" clipRule="evenodd" /></svg>
                    <span>{file.name}</span>
                    <span className="text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              {columns.length > 0 && (
                <div className="mt-6 grid gap-2">
                  <Label htmlFor="target">Target variable</Label>
                  <Select value={target} onValueChange={setTarget}>
                    <SelectTrigger id="target">
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="mt-8">
                <Button disabled={!canAnalyze || loading} onClick={() => void analyze()}>
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                      Analyzing…
                    </span>
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </div>

              {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

function Analyze() {
  // Use router state to get result
  const state = (window as any).history.state?.usr as any
  const result = state?.result as {
    target: string
    total_mi: number
    contributions: { feature: string; value: number }[]
  } | null

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r bg-white">
        <div className="h-14 border-b flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded bg-black" />
            <span className="font-semibold tracking-tight">Shapmi</span>
          </div>
        </div>
        <nav className="p-4 text-sm text-muted-foreground space-y-2">
          <div className="font-medium text-foreground">Project</div>
          <div>Overview</div>
          <div>Data</div>
          <div>Results</div>
          <div>Settings</div>
        </nav>
      </aside>
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b" />
        <main className="px-6 py-8 transition-[padding,background-color,color] duration-normal ease-standard">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Analysis</h2>
              {result && (
                <p className="text-sm text-muted-foreground">Target: {result.target} • Total MI: {result.total_mi}</p>
              )}
            </div>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>MI Breakdown</CardTitle>
              <CardDescription>Shapley-style feature contributions (placeholder)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <MIBarChart data={result?.contributions || []} />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts'

function MIBarChart({ data }: { data: { feature: string; value: number }[] }) {
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const [active, setActive] = useState<string | null>(null)
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="feature" tick={{ fontSize: 12 }} interval={0} angle={-30} dy={10} height={60} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {sorted.map((entry) => (
              <Cell
                key={entry.feature}
                fill={active === entry.feature ? 'hsl(222.2 47.4% 11.2%)' : 'hsl(215.4 16.3% 46.9%)'}
                className="transition-all duration-normal ease-standard"
                onMouseEnter={() => setActive(entry.feature)}
                onMouseLeave={() => setActive(null)}
              />)
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/analyze" element={<Analyze />} />
      </Routes>
    </BrowserRouter>
  )
}


