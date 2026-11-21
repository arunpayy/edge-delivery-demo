# AEM Edge Delivery Services Showcase

A live, zero-build Adobe Experience Manager (AEM) Edge Delivery Services (EDS) showcase demonstrating Content-Driven Development, 3-phase progressive loading (**Eager → Lazy → Delayed**), Edge JSON spreadsheets, reusable fragments, and accessible blocks.

## Environments
- **Local Dev Server:** http://localhost:3000 (via `aem up`, serving self-contained showcase pages from `./content/`)
- **Preview (after AEM Code Sync):** https://main--edge-delivery-demo--arunpayy.aem.page/
- **Live (after AEM Code Sync):** https://main--edge-delivery-demo--arunpayy.aem.live/
- **Repository:** https://github.com/arunpayy/edge-delivery-demo

## Quick Start (Run the Showcase Locally in 1 Minute)

```powershell
npm ci
aem up
```

Open http://localhost:3000 to explore all five showcase pages:
- `/` — Executive overview, live Core Web Vitals telemetry + **Inspect EDS Blocks** toggle, sheet-driven Use-Case Explorer, authoring mode tabs, reusable fragment, and FAQ accordion.
- `/executive-brief` — Boardroom ROI, **Live Multi-Brand Design Token Studio** (`design-studio`), why designers love Edge Delivery, Security/RBAC governance, 30-60-90 day pilot roadmap, AI/GEO readiness, and honest decision matrix.
- `/use-cases` — Six enterprise AEM Edge Delivery use cases (campaign velocity, Universal Editor, Adobe Commerce, multi-brand scale, and AEM 6.5 migration).
- `/docs/library/blocks` — Live Block Library paired with exact Google Docs / Word / DA.live authoring tables, Page `Metadata`, `Section Metadata` palette, and Author Style Checklist.
- `/architecture` — Edge Delivery pipeline, Eager/Lazy/Delayed waterfall, and AEM Code Sync go-live checklist.
- **Configuration Sheets:** `/placeholders.json`, `/redirects.json`, `/metadata.json`, `/data/use-cases.json`, and `/query-index.json`.

For a structured 10-minute presentation script, see [DEMO_PLAYBOOK.md](DEMO_PLAYBOOK.md).

## Showcase Blocks (`blocks/`)

| Block | Purpose |
| :--- | :--- |
| `hero` | Eager LCP hero supporting explicit authored tables (headline, CTAs, visual diagram) and auto-blocked `picture + h1`. |
| `design-studio` | Live 3-brand Design Token switcher (`Adobe Editorial`, `Nordic Luxury`, `Fintech Midnight`) with WCAG contrast swatches and fluid type specimens. |
| `eds-metrics` | Live browser Core Web Vitals (`TTFB`, `FCP`, `LCP`, `CLS`, asset weight, block count), 3-phase loading badges, and an interactive **Inspect EDS Blocks** overlay toggle. |
| `use-case-catalog` | Lazy-fetched (`IntersectionObserver`) Edge JSON sheet catalog (`/data/use-cases.json`) with category filter pills and instant search. |
| `form` | Lazy-fetched spreadsheet-driven form (`/forms/request-demo.json`) with WCAG ARIA validation and canonical Edge Delivery JSON payload preview/submission. |
| `cards` | Responsive grid cards including `cards (metrics)` KPI variant. |
| `columns` | Responsive multi-column split layouts including `columns (highlight)` and `columns (reversed)`. |
| `tabs` | WAI-ARIA keyboard-accessible tabs (`ArrowLeft`, `ArrowRight`, `Home`, `End`). |
| `accordion` | Semantic `<details>` / `<summary>` disclosure panels. |
| `fragment` | Dynamic reusable content fragments (`/fragments/cta-banner.plain.html`). |
| `header` & `footer` | Responsive fragment-driven navigation and footer (`/nav.plain.html`, `/footer.plain.html`). |

## Quality Checks

```powershell
# ESLint (airbnb-base) + Stylelint (stylelint-config-standard)
npm run lint

# Unit tests for pure catalog & form spreadsheet helpers
node --test test/catalog-utils.test.js test/form-utils.test.js
```

## Connect to Live `*.aem.page` / `*.aem.live`

1. Install the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync/installations/new) on `arunpayy/edge-delivery-demo`.
2. Choose your content store (**DA.live** or **Google Drive** via `fstab.yaml`).
3. Author `index`, `nav`, `footer`, `fragments/cta-banner`, and `data/use-cases` (sheet) matching the structures in `./content/`.
4. Preview and publish using the AEM Sidekick browser extension.
