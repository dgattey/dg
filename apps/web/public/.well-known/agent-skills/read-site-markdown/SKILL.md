---
name: read-site-markdown
description: Read this site as Markdown via /llms.txt, /llms-full.txt, .md twins, and Accept negotiation.
---

# Read site Markdown

Prefer Markdown over HTML chrome for public pages.

## Discovery indexes

- `/llms.txt` is a curated index of public pages with absolute `.md` links.
- `/llms-full.txt` contains all public page Markdown in one file.

## Per-page Markdown

Each public HTML page has a `.md` twin:

- `/` → `/index.md`
- `/music` → `/music.md`
- `/music/albums` → `/music/albums.md`

You can also request the HTML URL with `Accept: text/markdown`. When that type is explicitly preferred, the response body is Markdown.

## Scope

Use only these public Markdown surfaces. Do not invent private endpoints.
