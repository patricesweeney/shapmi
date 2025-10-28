import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
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
    try { sessionStorage.setItem('shapmi:lastResult', JSON.stringify(data)) } catch {}
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
  // Prefer router state, fall back to session storage
  const location = useLocation()
  const fromState = (location.state as any)?.result
  const persisted = fromState ? fromState : (() => {
    try { return JSON.parse(sessionStorage.getItem('shapmi:lastResult') || 'null') } catch { return null }
  })()
  const result = persisted as {
    target: string
    total_mi: number
    contributions: { feature: string; value: number }[]
    entropy?: number
    entropy_pct?: number
    entropy_max?: number
  } | null
  const [mode, setMode] = useState<'absolute' | 'percent'>('percent')
  const [activeNav, setActiveNav] = useState<'overview' | 'info'>('info')

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] mx-16">
      <aside className="bg-white">
        <div className="h-14 border-b border-neutral-200 flex items-center px-16">
          <div className="flex items-center gap-2"><div className="h-5 w-5 rounded bg-neutral-900" /></div>
        </div>
        <nav className="px-16 py-4 text-sm font-light text-neutral-700 space-y-2">
          <button
            className={(activeNav === 'overview' ? 'border-neutral-900 text-neutral-900 font-medium ' : 'text-neutral-700 hover:text-neutral-900 ') + 'pl-3 border-l-2 border-transparent w-full text-left'}
            onClick={() => setActiveNav('overview')}
          >
            Overview
          </button>
          <button
            className={(activeNav === 'info' ? 'border-neutral-900 text-neutral-900 font-medium ' : 'text-neutral-700 hover:text-neutral-900 ') + 'pl-3 border-l-2 border-transparent w-full text-left'}
            onClick={() => setActiveNav('info')}
          >
            Info Decomp
          </button>
        </nav>
      </aside>
      <div className="min-h-screen bg-white">
        <div className="h-14 border-b border-neutral-200 px-16" />
        <main className="px-16 py-12 transition-[padding,background-color,color] duration-150 ease-in-out">
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-[1.4rem] font-medium text-neutral-900 tracking-tight">Analysis</h2>
                {result && (
                  <p className="text-sm font-light text-neutral-600">Target: {result.target} · Total MI: {(result.total_mi ?? 0).toFixed(3)} · Entropy: {(result.entropy ?? 0).toFixed(3)} bits</p>
                )}
              </div>
              <div className="text-sm font-light text-neutral-600">
                <div className="inline-flex items-center rounded-[8px] border border-neutral-200 overflow-hidden">
                  <button
                    className={"px-3 py-1 transition-colors duration-150 " + (mode === 'absolute' ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100')}
                    onClick={() => setMode('absolute')}
                  >
                    abs
                  </button>
                  <button
                    className={"px-3 py-1 transition-colors duration-150 " + (mode === 'percent' ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100')}
                    onClick={() => setMode('percent')}
                  >
                    % of entropy
                  </button>
                </div>
              </div>
            </div>
            {activeNav === 'overview' ? (
              <>
                <section className="space-y-6">
                  <div>
                    <h3 className="text-[1.1rem] font-medium text-neutral-900">Five-number summaries</h3>
                    <p className="text-sm font-light text-neutral-500">Target highlighted; top 4 MI features</p>
                  </div>
                  <FiveNum summaries={result?.five_num} target={result?.target} />
                </section>
                <section className="space-y-6 mt-6">
                  <div>
                    <h3 className="text-[1.1rem] font-medium text-neutral-900">Spearman rank correlation</h3>
                    <p className="text-sm font-light text-neutral-500">Target and top features</p>
                  </div>
                  <SpearmanHeatmap data={result?.spearman} />
                </section>
              </>
            ) : (
              <>
                <section className="space-y-6">
                  <div>
                    <h3 className="text-[1.1rem] font-medium text-neutral-900">Target entropy</h3>
                    <p className="text-sm font-light text-neutral-500">How informative the target is</p>
                  </div>
                  <div className="w-full opacity-0 animate-[fadeIn_200ms_ease-out_forwards]">
                    {result ? (
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-3 rounded-full bg-neutral-100 overflow-hidden">
                          <div className="h-full bg-neutral-400/70 transition-all duration-150 ease-in-out" style={{ width: `${Math.max(0, Math.min(100, result.entropy_pct ?? 0))}%` }} />
                        </div>
                        <div className="text-sm font-light text-neutral-600 min-w-[88px] text-right">
                          {(result.entropy_pct ?? 0).toFixed(0)}%
                        </div>
                      </div>
                    ) : (
                      <div className="h-3 rounded-full bg-neutral-100" />
                    )}
                  </div>
                </section>

                <section className="space-y-6 mt-6">
                  <div>
                    <h3 className="text-[1.1rem] font-medium text-neutral-900">Info Decomp</h3>
                    <p className="text-sm font-light text-neutral-500">Shapley-style feature contributions</p>
                  </div>
                  <div className="w-full overflow-x-auto opacity-0 animate-[fadeIn_200ms_ease-out_forwards]">
                    <MIBarChart data={result?.contributions || []} mode={mode} entropy={result?.entropy} />
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function MIBarChart({ data, mode, entropy }: { data: { feature: string; value: number }[]; mode: 'absolute' | 'percent'; entropy?: number }) {
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const [active, setActive] = useState<string | null>(null)
  const values = sorted.map(d => ({
    feature: d.feature,
    value: mode === 'percent' && (entropy ?? 0) > 0 ? (d.value / (entropy as number)) * 100 : d.value,
  }))
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={values} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid vertical={false} strokeDasharray="0" stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 200 }} tickFormatter={(v) => mode === 'percent' ? `${Math.round(Number(v))}%` : Number(v).toFixed(2)} />
          <YAxis type="category" dataKey="feature" tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 200 }} width={100} />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
            contentStyle={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}
            formatter={(val) => mode === 'percent' ? `${Math.round(Number(val))}%` : Number(val as number).toFixed(2)}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#5C6670" opacity={0.8} isAnimationActive={false} className="transition-all duration-150 ease-in-out">
            {values.map((entry) => (
              <Cell
                key={entry.feature}
                fill="#5C6670"
                fillOpacity={active === entry.feature ? 1.0 : 0.8}
                style={{ transition: 'opacity 150ms ease-in-out, filter 150ms ease-in-out', filter: active === entry.feature ? 'brightness(1.06)' : 'none' }}
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


function FiveNum({ summaries, target }: { summaries?: Record<string, any> | null; target?: string }) {
  if (!summaries) return null
  const entries = Object.entries(summaries)
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-neutral-500 font-light">
            <th className="text-left py-2 pr-4 font-light">Variable</th>
            <th className="text-right py-2 px-2 font-light">Min</th>
            <th className="text-right py-2 px-2 font-light">Q1</th>
            <th className="text-right py-2 px-2 font-light">Median</th>
            <th className="text-right py-2 px-2 font-light">Q3</th>
            <th className="text-right py-2 px-2 font-light">Max</th>
            <th className="text-right py-2 pl-2 font-light">Missing</th>
          </tr>
        </thead>
        <tbody className="align-top">
          {entries.map(([key, summary]) => (
            <tr key={key} className={key === target ? 'text-neutral-900 font-medium' : 'text-neutral-700 font-light'}>
              <td className={(key === target ? 'border-l-2 border-neutral-900 pl-2 ' : '') + 'py-2 pr-4'}>{key}</td>
              {summary.numeric ? (
                <>
                  <td className="text-right py-2 px-2">{Number(summary.min).toFixed(2)}</td>
                  <td className="text-right py-2 px-2">{Number(summary.q1).toFixed(2)}</td>
                  <td className="text-right py-2 px-2">{Number(summary.median).toFixed(2)}</td>
                  <td className="text-right py-2 px-2">{Number(summary.q3).toFixed(2)}</td>
                  <td className="text-right py-2 px-2">{Number(summary.max).toFixed(2)}</td>
                </>
              ) : (
                <>
                  <td className="text-right py-2 px-2" colSpan={5}>—</td>
                </>
              )}
              <td className="text-right py-2 pl-2">{Number(summary.missing || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SpearmanHeatmap({ data }: { data?: { order: string[]; matrix: number[][] } | null }) {
  if (!data || !data.order?.length || !data.matrix?.length) return null
  const labels = data.order
  const matrix = data.matrix
  const bg = (v: number) => {
    const x = Math.max(-1, Math.min(1, v))
    const r = x < 0 ? 244 : 34
    const g = x < 0 ? 67 : 197
    const b = x < 0 ? 54 : 94
    const a = Math.abs(x) * 0.9 + 0.1
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }
  return (
    <div className="w-full overflow-x-auto">
      <table className="text-xs">
        <thead>
          <tr>
            <th className="w-28" />
            {labels.map((l) => (
              <th key={l} className="w-14 px-1 py-1 font-extralight text-neutral-400 text-center truncate">{l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((row, i) => (
            <tr key={row}>
              <th className="w-28 px-1 py-1 font-extralight text-neutral-400 text-left truncate">{row}</th>
              {labels.map((_, j) => (
                <td key={`${i}-${j}`} className="w-14 h-8 text-center" style={{ background: bg(matrix[i][j]) }}>
                  <span className="text-[10px] font-extralight text-white/90" style={{ mixBlendMode: 'overlay' }}>{matrix[i][j].toFixed(2)}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

