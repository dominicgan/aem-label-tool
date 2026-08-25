import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { parseJson } from '@/lib/parseJson'

type InputMode = 'upload' | 'paste'

interface FileUploaderProps {
  title: string
  onLoad: (data: Record<string, string>) => void
  parser?: (raw: string) => Record<string, string>
}

export function FileUploader({ title, onLoad, parser = parseJson }: FileUploaderProps) {
  const [mode, setMode] = useState<InputMode>('upload')
  const [pasteValue, setPasteValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loadedCount, setLoadedCount] = useState<number | null>(null)

  function handleLoad(raw: string) {
    setError(null)
    try {
      const parsed = parser(raw)
      setLoadedCount(Object.keys(parsed).length)
      onLoad(parsed)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON.')
      setLoadedCount(null)
    }
  }

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => handleLoad((e.target?.result as string) ?? '')
    reader.readAsText(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    multiple: false,
  })

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {title}
        </h2>
        {loadedCount !== null && (
          <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {loadedCount} entries loaded
          </span>
        )}
      </div>

      <div className="flex gap-5">
        {(['upload', 'paste'] as InputMode[]).map((m) => (
          <label
            key={m}
            className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400"
          >
            <input
              type="radio"
              name={`mode-${title}`}
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
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors ${
            isDragActive
              ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950'
              : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-indigo-300 hover:bg-indigo-50/40 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {isDragActive ? 'Drop here…' : 'Drag & drop a .json file, or click to browse'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            placeholder='{ "common.loading": "Laden..." }'
            rows={6}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 font-mono text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
          />
          <button
            onClick={() => handleLoad(pasteValue)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors"
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
  )
}
