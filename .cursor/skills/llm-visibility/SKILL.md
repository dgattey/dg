---
name: llm-visibility
description: Add or update public Next.js pages so they stay visible to LLMs and AI agents via the shared markdown registry, .md twins, Accept negotiation, and llms.txt.
---

# LLM visibility

Use this skill when adding a public page, changing public routes, or auditing
agent/LLM readability of the site.

## Goal

LLMs and coding agents should get clean Markdown for public content — not HTML
chrome. Follow the Evil Martians-style surface already wired in this repo.

## Single registry

Public Markdown pages live in:

`packages/shared-core/routes/app.ts` (`markdownPages`)

Each entry needs: `path`, `title`, `summary`, `changeFrequency`, `priority`.

Derived automatically from that list:

- `.md` URL convention (`/` → `/index.md`, else `path.md`)
- Proxy Accept negotiation + `Link` / `Vary` headers
- `sitemap.xml`
- `/llms.txt` and `/llms-full.txt`
- Internal rewrite target `/llm-markdown/...`

## Checklist for a new public page

1. **Registry** — append to `markdownPages` (and export a route constant if useful).
2. **Generator** — add `pageMarkdownGenerators[path]` in
   `apps/web/src/services/markdown/getPageMarkdown.ts`. Prefer the same data
   sources as the HTML page. TypeScript fails the build if a registry path is
   missing from the generator map.
3. **HTML page** — use `markdownAlternates(path)` in metadata and wrap content
   in `<MarkdownPageShell path={path}>`.
4. **Skip private surfaces** — `/dev-console`, `/api/*`, OAuth, webhooks.

Do **not** add per-page `.md/route.ts` files or edit the proxy matcher for each
page. Proxy already rewrites registered `.md` URLs and `Accept: text/markdown`
to `/llm-markdown`.

## Anti-patterns

- Hand-authored Markdown that can drift from the React page
- User-Agent sniffing / cloaking
- Invented meta tags (`ai-content`, `llms`)
- Blocking AI crawlers in `robots.txt` unless product policy requires it
- Serving Markdown only behind a human-facing toggle button

## Quick verification

```bash
curl -sI https://dylangattey.com/llms.txt
curl -s https://dylangattey.com/index.md | head
curl -sI -H 'Accept: text/markdown' https://dylangattey.com/
curl -sI -H 'Accept: application/pdf' https://dylangattey.com/   # expect 406
```

Also useful: acceptmarkdown.com and isitagentready.com against production.
