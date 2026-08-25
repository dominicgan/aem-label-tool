import { useState } from 'react'
import { Check } from 'lucide-react'
import { FileUploader } from '@/components/FileUploader'

type RowStatus = 'both' | 'aem-only' | 'fe-only'
type ViewFilter = 'all' | 'missing-aem' | 'missing-fe'
type CopiedKey = string | null

interface CompareRow {
  key: string
  aemValue: string | null
  feValue: string | null
  status: RowStatus
}

function buildCompareRows(
  aemData: Record<string, string>,
  feData: Record<string, string>
): CompareRow[] {
  const allKeys = new Set([...Object.keys(aemData), ...Object.keys(feData)])
  return Array.from(allKeys)
    .sort()
    .map((key) => {
      const aemValue = aemData[key] ?? null
      const feValue = feData[key] ?? null
      const status: RowStatus = aemValue !== null && feValue !== null ? 'both' : aemValue !== null ? 'aem-only' : 'fe-only'
      return { key, aemValue, feValue, status }
    })
}

const VIEW_OPTIONS: { value: ViewFilter; label: string }[] = [
  { value: 'all', label: 'Show all' },
  { value: 'missing-fe', label: 'Missing in FE data' },
  { value: 'missing-aem', label: 'Missing in AEM data' },
]

export function ComparePage() {
  const [aemData, setAemData] = useState<Record<string, string> | null>(null)
  const [feData, setFeData] = useState<Record<string, string> | null>(null)
  const [view, setView] = useState<ViewFilter>('all')
  const [copiedCell, setCopiedCell] = useState<CopiedKey>(null)

  const rows = aemData && feData ? buildCompareRows(aemData, feData) : []

  const filtered = rows.filter((row) => {
    if (view === 'missing-aem') return row.status === 'fe-only'
    if (view === 'missing-fe') return row.status === 'aem-only'
    return true
  })

  const missingInFe = rows.filter((r) => r.status === 'aem-only').length
  const missingInAem = rows.filter((r) => r.status === 'fe-only').length

  async function copyToClipboard(text: string, cellId: string) {
    await navigator.clipboard.writeText(text)
    setCopiedCell(cellId)
    setTimeout(() => setCopiedCell((prev) => (prev === cellId ? null : prev)), 1500)
  }

  return (
    <div className="py-10 px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">AEM ↔ FE Compare</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Upload both JSON files to see which keys are missing on each side.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FileUploader title="AEM Data" onLoad={setAemData} />
          <FileUploader title="FE Data" onLoad={setFeData} />
        </div>

        {rows.length > 0 && (
          <>
            {/* Summary */}
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                {rows.length} total keys
              </span>
              {missingInFe > 0 && (
                <span className="rounded-full bg-gray-200 dark:bg-gray-700 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                  {missingInFe} missing in FE
                </span>
              )}
              {missingInAem > 0 && (
                <span className="rounded-full bg-red-100 dark:bg-red-900/40 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300">
                  {missingInAem} missing in AEM
                </span>
              )}
            </div>

            {/* View toggle */}
            <div className="flex flex-wrap gap-5">
              {VIEW_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <input
                    type="radio"
                    name="view"
                    value={opt.value}
                    checked={view === opt.value}
                    onChange={() => setView(opt.value)}
                    className="accent-indigo-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            {/* Comparison table */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
                {filtered.length} / {rows.length} entries
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      <th className="px-4 py-3 w-1/3">Key</th>
                      <th className="px-4 py-3 w-1/3">AEM Label</th>
                      <th className="px-4 py-3 w-1/3">FE Label</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filtered.map((row) => (
                      <CompareRow
                        key={row.key}
                        row={row}
                        copiedCell={copiedCell}
                        onCopy={copyToClipboard}
                      />
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                          No entries for this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {(!aemData || !feData) && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
            {!aemData && !feData
              ? 'Upload both files to start comparing.'
              : !aemData
              ? 'Waiting for AEM data…'
              : 'Waiting for FE data…'}
          </p>
        )}
      </div>
    </div>
  )
}

interface CompareRowProps {
  row: CompareRow
  copiedCell: CopiedKey
  onCopy: (text: string, cellId: string) => Promise<void>
}

function CompareRow({ row, copiedCell, onCopy }: CompareRowProps) {
  const rowClass =
    row.status === 'aem-only'
      ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
      : row.status === 'fe-only'
      ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40'
      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'

  return (
    <tr className={`transition-colors ${rowClass}`}>
      <CopyCell text={row.key} cellId={`key-${row.key}`} label="key" copiedCell={copiedCell} onCopy={onCopy} />
      {row.aemValue !== null ? (
        <CopyCell text={row.aemValue} cellId={`aem-${row.key}`} label="AEM label" copiedCell={copiedCell} onCopy={onCopy} />
      ) : (
        <td className="px-4 py-2.5 font-mono text-gray-300 dark:text-gray-700">—</td>
      )}
      {row.feValue !== null ? (
        <CopyCell text={row.feValue} cellId={`fe-${row.key}`} label="FE label" copiedCell={copiedCell} onCopy={onCopy} />
      ) : (
        <td className="px-4 py-2.5 font-mono text-gray-300 dark:text-gray-700">—</td>
      )}
    </tr>
  )
}

interface CopyCellProps {
  text: string
  cellId: string
  label: string
  copiedCell: CopiedKey
  onCopy: (text: string, cellId: string) => Promise<void>
}

function CopyCell({ text, cellId, label, copiedCell, onCopy }: CopyCellProps) {
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
