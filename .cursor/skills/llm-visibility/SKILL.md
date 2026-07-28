---
name: llm-visibility
description: Add or update public Next.js pages so they stay visible to LLMs and AI agents via the shared markdown registry, page-local Markdown modules, Accept negotiation, and llms.txt.
---

# LLM visibility

Use this skill when adding a public page, changing public routes, or auditing
agent/LLM readability of the site.

## Goal

LLMs and coding agents should get clean Markdown for public content — not HTML
chrome.

## Single registry + page-local content

Registry (paths, titles, sitemap, llms index):

`packages/shared-core/routes/app.ts` → `markdownPages`

Page Markdown lives **next to the page**:

- `apps/web/src/app/home/homepageMarkdown.ts`
- `apps/web/src/app/music/musicMarkdown.ts`

Wire generators in `apps/web/src/app/llm-markdown/pageMarkdown.ts`.

Derived from the registry:

- `.md` URL convention (`/` → `/index.md`, else `path.md`)
- Proxy Accept negotiation + `Link` / `Vary`
- `sitemap.xml`, `/llms.txt`, `/llms-full.txt`
- Internal rewrite target `/llm-markdown/...`

## Checklist for a new public page

1. **Registry** — append to `markdownPages` (export a route constant if useful).
2. **Page Markdown** — add `*Markdown.ts` beside that page’s UI/data.
3. **Wire** — add `pageMarkdownGenerators[path]` in `llm-markdown/pageMarkdown.ts`.
4. **HTML page** — `markdownAlternates(path)` in metadata.
5. **Skip private surfaces** — `/dev-console`, `/api/*`, OAuth, webhooks.

Do **not** add per-page `.md/route.ts` files or edit the proxy matcher per page.

## Anti-patterns

- Generic Markdown services for page-specific content
- Hand-authored Markdown that drifts from the React page
- User-Agent sniffing / cloaking
- Invented meta tags (`ai-content`, `llms`)

## Quick verification

```bash
curl -sI https://dylangattey.com/llms.txt
curl -s https://dylangattey.com/index.md | head
curl -sI -H 'Accept: text/markdown' https://dylangattey.com/
curl -sI -H 'Accept: application/pdf' https://dylangattey.com/   # expect 406
```
