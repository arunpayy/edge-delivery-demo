# AEM Edge Delivery Services — 10-Minute Live Demo Playbook

Use this playbook to present **AEM Edge Delivery Services (EDS)** live to clients, architects, or engineering leaders using `E:\edge-delivery-demo`.

## The 1-Sentence Executive Pitch
> **AEM Edge Delivery Services turns familiar documents and spreadsheets into 100/100 Core Web Vitals web pages at the global edge in seconds — cutting campaign launch time from 2-week dev sprints to minutes while lifting SEO and conversion.**

### Selling Points by Audience

| Audience | Their Pain Point | Edge Delivery Selling Point |
| :--- | :--- | :--- |
| **CMO / Marketing** | Campaigns wait on dev sprints; slow mobile pages hurt SEO & paid-ad ROAS | Publish in **< 5 seconds** from Docs, Word, or DA.live with **100/100 Core Web Vitals** built in. |
| **CTO / Engineering** | Heavy front-end bundles, Maven/CRX deploys, martech tags breaking Lighthouse | **Zero bundler, zero SPA hydration, zero CRX packages** (`~44 KB` JS+CSS) + 3-phase **Eager → Lazy → Delayed** isolation. |
| **Enterprise Architect** | Big-bang CMS migrations fail; strict governance required on regulated pages | **Strangler-fig path-by-path migration** from AEM 6.5; add **Universal Editor (XWalk)** on AEMaaCS for DAM & workflows. |
| **Content & Ops Teams** | Complex CMS dialogs; dev tickets for simple catalogs or redirects | **Zero training curve + Spreadsheet-as-API** (`/data/use-cases.json`, `/placeholders.json`, `/redirects.json`, `/metadata.json`). |

### 4 "Mic-Drop" Proof Moments During Your Live Demo
1. **Speed Proof (`/`):** Live telemetry bar (`TTFB ~66 ms · LCP ~180 ms · CLS 0.001 · 43.9 KB JS+CSS`) + watching **Phase 3 · Delayed** wait 3 seconds before loading RUM/analytics.
2. **Design System Proof (`/executive-brief`):** Click **Nordic Luxury** and **Fintech Midnight** in the **Live Design Token Studio** — the entire multi-page showcase re-skins instantaneously without changing a single authored document, proving brand lock & Figma-to-CSS parity for Design Directors.
3. **Architecture Proof (`/`):** Click **Inspect EDS Blocks** to highlight all `7 / 7` isolated vanilla components live.
4. **Authoring & Scale Proof (`/` & `/docs/library/blocks`):** Filter the sheet-driven Use-Case Catalog (`/data/use-cases.json`) and demonstrate the shared `/fragments/cta-banner` updating across all 5 pages from one edit.

## Before the Meeting (2 Minutes)
1. Start the local Edge Delivery dev server:
   ```powershell
   cd E:\edge-delivery-demo
   aem up
   ```
2. Open http://localhost:3000 in Chrome (and keep DevTools → **Network** tab ready).
3. Keep `E:\edge-delivery-demo\content\index.html` and `E:\edge-delivery-demo\content\data\use-cases.json` open in your editor so you can demonstrate instant live edits.

---

## Live Walkthrough Script

### Minute 0–2: Instant First Paint & Live Core Web Vitals (`/`)
- Point out the **Hero** section renders immediately with zero bundler or SPA hydration delay.
- Scroll to the **Live Edge Delivery Telemetry & Block Inspector** strip right below the hero:
  - Point to real-time `TTFB`, `FCP`, `LCP`, `CLS`, and `JS + CSS` transfer weight.
  - Point to the **3-Phase Loading** pills (`Eager`, `Lazy`, `Delayed`) — reload the page once so the audience watches **Phase 3 · Delayed (RUM)** switch from *Deferred (3s)* to *Complete* after 3 seconds without blocking LCP.

### Minute 2–4: Click **"Inspect EDS Blocks"** (`/`)
- Click **Inspect EDS Blocks** inside the telemetry bar.
- Every block on the page outlines with its live `data-block-name` and `data-block-status="loaded"` label.
- Explain: *Each block is an independent vanilla JS + CSS folder under `blocks/`. No global monolithic bundle, no AEM Sling models or clientlib rebuilds.*

### Minute 4–6: Spreadsheet-as-API Dynamic Use Case (`use-case-catalog`)
- Scroll to **Interactive Enterprise Use-Case Explorer**.
- Filter by **Commerce**, **Universal Editor**, and **Document Authoring**, then type `fragment` or `LCP` in the search box.
- Explain: *In AEM Edge Delivery, business users maintain a Google Sheet or Excel file; Sidekick publishes it straight to the CDN as `/data/use-cases.json`. Zero backend API server.*
- **Live Edit Trick:** Open `content/data/use-cases.json`, edit a title or add one row, save, and refresh `/` to show instant data updates.

### Minute 6–8: Authoring-to-DOM & Reusable Fragments (`/docs/library/blocks`)
- Navigate to **Block Library** (`/docs/library/blocks`).
- Show how simple 2-column document tables (`Cards (metrics)`, `Tabs`, `Accordion`, `Columns (highlight)`, `Fragment`) become responsive, keyboard-accessible UI.
- Scroll to the dark CTA banner at the bottom and point out that the exact same `/fragments/cta-banner` fragment appears on `/`, `/use-cases`, and `/architecture`.
- **Live Edit Trick:** Edit one heading in `content/fragments/cta-banner.html`, refresh both `/` and `/use-cases`, and show both pages updated from a single source.

### Minute 8–10: Enterprise Use Cases & Go-Live Path (`/use-cases` & `/architecture`)
- Open **Use Cases** (`/use-cases`) to discuss the 6 enterprise adoption patterns (Campaign Velocity, Universal Editor XWalk, Adobe Commerce Storefront, Multi-Brand Localization, and Incremental AEM 6.5 Migration).
- Open **Architecture** (`/architecture`) to walk through the Content Bus / Code Bus / Media Bus pipeline and the 3-minute AEM Code Sync go-live checklist.

---

## Recommended Official Adobe Starter Repositories (Reference Only)

| Goal | Official GitHub Template |
| :--- | :--- |
| Standard Document Authoring (Docs / Word / DA) | https://github.com/adobe/aem-boilerplate |
| Pre-built Production Blocks Reference | https://github.com/adobe/aem-block-collection |
| AEMaaCS + Universal Editor (WYSIWYG / XWalk) | https://github.com/adobe-rnd/aem-boilerplate-xwalk |
| AEM Forms on Edge Delivery | https://github.com/adobe-rnd/aem-boilerplate-forms |
| Adobe Commerce Storefront on Edge Delivery | https://github.com/hlxsites/aem-boilerplate-commerce |
| Commerce + Universal Editor (XCom) | https://github.com/adobe-rnd/aem-boilerplate-xcom |
| Serverless Edge Functions | https://github.com/adobe/aem-edge-functions-boilerplate |
