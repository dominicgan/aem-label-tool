import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { AlertCircle, Check, Moon, Sun, Upload } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type InputMode = 'upload' | 'paste'
type CopiedKey = string | null

function parseJson(raw: string): Record<string, string> {
  const parsed = JSON.parse(raw) as unknown
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('File must be a JSON object.')
  }
  const entries = parsed as Record<string, unknown>
  for (const [k, v] of Object.entries(entries)) {
    if (typeof v !== 'string') {
      throw new Error(`Value for key "${k}" is not a string. Only flat string-valued JSON is supported.`)
    }
  }
  return entries as Record<string, string>
}

function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return [dark, setDark] as const
}

export default function App() {
  const [dark, setDark] = useDarkMode()
  const [mode, setMode] = useState<InputMode>('upload')
  const [pasteValue, setPasteValue] = useState('')
  const [entries, setEntries] = useState<[string, string][]>([])
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [copiedCell, setCopiedCell] = useState<CopiedKey>(null)

  function loadJson(raw: string) {
    setError(null)
    try {
      const parsed = parseJson(raw)
      setEntries(Object.entries(parsed))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON.')
      setEntries([])
    }
  }

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => loadJson((e.target?.result as string) ?? '')
    reader.readAsText(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    multiple: false,
  })

  async function copyToClipboard(text: string, cellId: string) {
    await navigator.clipboard.writeText(text)
    setCopiedCell(cellId)
    setTimeout(() => setCopiedCell((prev) => (prev === cellId ? null : prev)), 1500)
  }

  const filtered = entries.filter(
    ([k, v]) =>
      k.toLowerCase().includes(search.toLowerCase()) ||
      v.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 transition-colors">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">i18n Label Tool</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Upload or paste a flat react-i18next JSON file to browse its key–value pairs.
            </p>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="mt-1 rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Input card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm space-y-5">
          <div className="flex gap-6">
            {(['upload', 'paste'] as InputMode[]).map((m) => (
              <label
                key={m}
                className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <input
                  type="radio"
                  name="mode"
                  value={m}
                  checked={mode === m}
                  onChange={() => setMode(m)}
                  className="accent-indigo-600"
                />
                {m === 'upload' ? 'Upload file' : 'Paste JSON'}
              </label>
            ))}
          </div>

          {mode === 'upload' ? (
            <div
              {...getRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 transition-colors ${
                isDragActive
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950'
                  : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-indigo-300 hover:bg-indigo-50/40 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isDragActive ? 'Drop the file here…' : 'Drag & drop a .json file here, or click to browse'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                placeholder='{ "common.loading": "Laden...", "common.error": "Fehler" }'
                rows={8}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 font-mono text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
              />
              <button
                onClick={() => loadJson(pasteValue)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors"
              >
                Parse JSON
              </button>
            </div>
          )}

          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invalid JSON</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Table */}
        {entries.length > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search keys or values…"
                className="w-full max-w-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
              />
              <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                {filtered.length} / {entries.length} entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 w-1/2">Key</th>
                    <th className="px-4 py-3 w-1/2">Label</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map(([key, value]) => (
                    <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <TableCell
                        text={key}
                        cellId={`key-${key}`}
                        label="key"
                        copiedCell={copiedCell}
                        onCopy={copyToClipboard}
                      />
                      <TableCell
                        text={value}
                        cellId={`val-${key}`}
                        label="label"
                        copiedCell={copiedCell}
                        onCopy={copyToClipboard}
                      />
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                        No entries match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface TableCellProps {
  text: string
  cellId: string
  label: 'key' | 'label'
  copiedCell: CopiedKey
  onCopy: (text: string, cellId: string) => Promise<void>
}

function TableCell({ text, cellId, label, copiedCell, onCopy }: TableCellProps) {
  const copied = copiedCell === cellId
  return (
    <td
      onClick={() => onCopy(text, cellId)}
      className="px-4 py-2.5 cursor-pointer group/cell select-none"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-gray-800 dark:text-gray-200 break-all">{text}</span>
        <span className="shrink-0 text-xs opacity-0 group-hover/cell:opacity-100 transition-opacity">
          {copied ? (
            <span className="flex items-center gap-1 text-green-500">
              <Check className="h-3 w-3" />
              Copied!
            </span>
          ) : (
            <span className="text-indigo-400 dark:text-indigo-500 whitespace-nowrap">
              Copy {label}
            </span>
          )}
        </span>
      </div>
    </td>
  )
}
