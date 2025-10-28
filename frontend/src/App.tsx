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
    <div className="min-h-screen bg-background text-foreground">
      <div className="h-14 border-b flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded bg-black" />
          <span className="font-semibold tracking-tight">Shapmi</span>
        </div>
      </div>
      <main className="px-6 py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Shapley Decomposition of Mutual Information</h1>
            <p className="text-muted-foreground">Upload a dataset, select your target, and get a placeholder decomposition.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload</CardTitle>
              <CardDescription>CSV or Excel files are supported.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
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
                  <Button>Select File</Button>
                </label>
                {file && <div className="mt-2 text-sm text-muted-foreground">{file.name}</div>}
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

              <div className="mt-6">
                <Button disabled={!canAnalyze || loading} onClick={() => void analyze()}>
                  {loading ? 'Analyzing…' : 'Analyze'}
                </Button>
              </div>

              {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
            </CardContent>
          </Card>
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
        <div className="h-14 border-b flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded bg-black" />
            <span className="font-semibold tracking-tight">Shapmi</span>
          </div>
        </div>
        <main className="px-6 py-8">
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

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

function MIBarChart({ data }: { data: { feature: string; value: number }[] }) {
  const sorted = [...data].sort((a, b) => b.value - a.value)
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="feature" tick={{ fontSize: 12 }} interval={0} angle={-30} dy={10} height={60} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" fill="hsl(222.2 47.4% 11.2%)" radius={[4, 4, 0, 0]} />
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


