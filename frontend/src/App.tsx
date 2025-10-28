import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { Button } from './components/ui/button'
import { Label } from './components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts'

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
  const [pageDragging, setPageDragging] = useState(false)

  const canAnalyze = useMemo(() => !!file && !!target, [file, target])

  const navigate = useNavigate()

  useEffect(() => {
    function hasFiles(e: DragEvent) {
      return Array.from(e.dataTransfer?.types || []).includes('Files')
    }
    function onDragEnter(e: DragEvent) {
      if (!hasFiles(e)) return
      setPageDragging(true)
    }
    function onDragOver(e: DragEvent) {
      if (!hasFiles(e)) return
      e.preventDefault()
      setPageDragging(true)
    }
    function onDragLeave(e: DragEvent) {
      if (!hasFiles(e)) return
      setPageDragging(false)
    }
    function onDrop(e: DragEvent) {
      if (!hasFiles(e)) return
      e.preventDefault()
      setPageDragging(false)
      const f = e.dataTransfer?.files?.[0]
      if (f) void handleFileChange(f)
    }
    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [])

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
    <div className={"min-h-screen bg-background text-foreground transition-colors duration-normal ease-standard " + (pageDragging ? 'cursor-copy' : '')}>
      <AnimatePresence>
        {pageDragging && (
          <motion.div
            className="fixed inset-0 z-10 pointer-events-none bg-green-100/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
      <div className="h-14 border-b flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-black" />
        </div>
      </div>
      <main className={result ? 'px-6 py-8' : 'px-6 py-0'}>
        <div className={result ? 'mx-auto max-w-5xl' : 'mx-auto max-w-2xl min-h-[calc(100vh-56px)] flex flex-col items-center'}>
          <motion.div className={result ? 'mb-6 w-full' : 'w-full text-center mt-[15vh]'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <h1 className="mx-auto text-[1.8rem] font-medium tracking-tight leading-snug">
              Import dataset
            </h1>
            <p className="mt-2 text-[1rem] leading-[1.4] font-light text-muted-foreground">Upload → Select target → Decompose</p>
          </motion.div>

          <motion.div className="mt-4 flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <Button
              disabled={loading || (!file ? false : !canAnalyze)}
              onClick={() => {
                if (!file) {
                  document.getElementById('file')?.click()
                  return
                }
                if (canAnalyze) void analyze()
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-2 text-sm font-normal"
                  >
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                    Analyzing…
                  </motion.span>
                ) : file ? (
                  <motion.span
                    key={canAnalyze ? 'decompose' : 'select-target'}
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    transition={{ duration: 0.15 }}
                  >
                    {canAnalyze ? 'decompose' : 'select target'}
                  </motion.span>
                ) : (
                  <motion.span
                    key="select-file"
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    transition={{ duration: 0.15 }}
                  >
                    select file
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          <motion.div className="mt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
            <div
              className={
                'relative text-center cursor-copy transition-all duration-150 ease-in-out ' +
                'rounded-[12px] p-10 border border-dashed border-black/10 hover:border-black/20 hover:bg-black/5 hover:scale-[1.02] active:bg-black/10 '
              }
              onDragOver={(e) => {
                e.preventDefault()
                e.currentTarget.classList.add('bg-black/5', 'border-black/20')
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-black/5', 'border-black/20')
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove('bg-black/5', 'border-black/20')
                const f = e.dataTransfer.files?.[0]
                if (f) void handleFileChange(f)
              }}
              onClick={() => document.getElementById('file')?.click()}
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
              <div className="inline-flex items-center gap-2 text-[0.95rem] leading-[1.4] font-light text-muted-foreground">
                <span>Drop or select CSV/Excel file</span>
              </div>

              <AnimatePresence initial={false}>
                {file && (
                  <motion.div
                    key="selected-file"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="mt-3 text-xs text-muted-foreground"
                  >
                    Selected: <span className="text-foreground/80">{file.name}</span> <span className="text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {columns.length > 0 && (
                <motion.div
                  key="target-select"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="mt-6 grid gap-2 max-w-sm"
                >
                  <Label htmlFor="target" className="font-light">Target</Label>
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
                </motion.div>
              )}
            </AnimatePresence>
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
    <div className="min-h-screen grid grid-cols-[240px_1fr] mx-16">
      <aside className="bg-white">
        <div className="h-14 border-b border-neutral-200 flex items-center px-16">
          <div className="flex items-center gap-2"><div className="h-5 w-5 rounded bg-neutral-900" /></div>
        </div>
        <nav className="px-16 py-4 text-sm font-light text-neutral-700 space-y-2">
          <div className="text-neutral-900 font-medium">Project</div>
          <div className="pl-3">Overview</div>
          <div className="pl-3">Data</div>
          <div className="pl-3 border-l-2 border-neutral-900 text-neutral-900 font-medium">Results</div>
          <div className="pl-3">Settings</div>
        </nav>
      </aside>
      <div className="min-h-screen bg-white">
        <div className="h-14 border-b border-neutral-200 px-16" />
        <main className="px-16 py-12 transition-[padding,background-color,color] duration-150 ease-in-out">
          <div className="space-y-3">
            <div>
              <h2 className="text-[1.4rem] font-medium text-neutral-900 tracking-tight">Analysis</h2>
              {result && (
                <p className="text-sm font-light text-neutral-600">Target: {result.target} · Total MI: {result.total_mi?.toFixed?.(3) ?? result.total_mi}</p>
              )}
            </div>
            <section className="space-y-6">
              <div>
                <h3 className="text-[1.1rem] font-medium text-neutral-900">MI Breakdown</h3>
                <p className="text-sm font-light text-neutral-500">Shapley-style feature contributions</p>
              </div>
              <div className="w-full overflow-x-auto opacity-0 animate-[fadeIn_200ms_ease-out_forwards]">
                <MIBarChart data={result?.contributions || []} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

function MIBarChart({ data }: { data: { feature: string; value: number }[] }) {
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const [active, setActive] = useState<string | null>(null)
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} margin={{ left: 20, right: 20 }}>
          <CartesianGrid vertical={false} strokeDasharray="0" stroke="#e5e7eb" />
          <XAxis dataKey="feature" tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 200 }} interval={0} angle={-30} dy={10} height={60} />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 200 }} />
          <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ boxShadow: 'none', border: '1px solid #e5e7eb' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#5C6670" opacity={0.8} className="transition-all duration-150 ease-in-out">
            {sorted.map((entry) => (
              <Cell
                key={entry.feature}
                fill="#5C6670"
                fillOpacity={active === entry.feature ? 0.9 : 0.8}
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


