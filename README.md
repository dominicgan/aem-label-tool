# AEM Label Tool

A small internal utility for frontend developers to inspect and compare react-i18next JSON translation files.

## Features

### Label Browser `/`
Upload or paste a flat i18n JSON file and browse all key–value pairs in a searchable table. Click any cell to copy its contents to the clipboard.

### AEM ↔ FE Compare `/aem-fe-compare`
Upload an AEM JSON file (wrapped in a `labels` key) alongside a flat FE JSON file to diff the two. Highlights rows where keys are missing on either side or where values differ.

### FE ↔ FE Compare `/fe-compare`
Same comparison view for diffing two flat FE JSON files against each other.

## Row highlight legend (compare pages)

| Colour | Meaning |
|--------|---------|
| Blue | Key exists on the left but is missing on the right |
| Red | Key exists on the right but is missing on the left |
| Yellow | Key exists on both sides but the values differ |

## Supported file formats

**Flat FE JSON** — standard react-i18next structure:
```json
{
  "common.loading": "Laden...",
  "common.error": "Fehler"
}
```

**AEM JSON** — wrapped in a `labels` key (falls back to flat if the key is absent):
```json
{
  "labels": {
    "common.loading": "Laden...",
    "common.error": "Fehler"
  }
}
```

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- TanStack Router
- react-dropzone
- shadcn-style UI components (Radix primitives)

## Development

```bash
npm install
npm run dev
```
