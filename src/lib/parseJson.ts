export function parseJson(raw: string): Record<string, string> {
  const parsed = JSON.parse(raw) as unknown
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('File must be a JSON object.')
  }
  const entries = parsed as Record<string, unknown>
  for (const [k, v] of Object.entries(entries)) {
    if (typeof v !== 'string') {
      throw new Error(
        `Value for key "${k}" is not a string. Only flat string-valued JSON is supported.`
      )
    }
  }
  return entries as Record<string, string>
}

export function parseAemJson(raw: string): Record<string, string> {
  const parsed = JSON.parse(raw) as unknown
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('File must be a JSON object.')
  }
  const obj = parsed as Record<string, unknown>
  if (
    'labels' in obj &&
    typeof obj.labels === 'object' &&
    obj.labels !== null &&
    !Array.isArray(obj.labels)
  ) {
    return parseJson(JSON.stringify(obj.labels))
  }
  // Fall back to flat structure
  return parseJson(raw)
}
