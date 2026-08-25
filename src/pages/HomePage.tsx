import { useState } from 'react'
import { Check } from 'lucide-react'
import { FileUploader } from '@/components/FileUploader'

type CopiedKey = string | null

export function HomePage() {
  const [entries, setEntries] = useState<[string, string][]>([])
  const [search, setSearch] = useState('')
  const [copiedCell, setCopiedCell] = useState<CopiedKey>(null)

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
    <div className="py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">i18n Label Browser</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Upload or paste a flat react-i18next JSON file to browse its key–value pairs.
          </p>
        </div>

        <FileUploader title="JSON File" onLoad={(data) => setEntries(Object.entries(data))} />

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
                      <CopyCell
                        text={key}
                        cellId={`key-${key}`}
                        label="key"
                        copiedCell={copiedCell}
                        onCopy={copyToClipboard}
                      />
                      <CopyCell
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
