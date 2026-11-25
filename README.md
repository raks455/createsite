# SiteForge

A self-hosted, multi-site website builder. One admin panel lets you create as many websites as you need and customize everything visually: pages, sections, colors, fonts, header, menu, footer, SEO, custom code, media and forms.

## Quick start

```bash
npm install
npm start          # or: npm run dev  (auto-restart on changes)
```

Open **http://localhost:3000/admin** and sign in with `admin` / `admin123`. Change the password under **Account** straight away.

| Environment variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `ADMIN_USER` / `ADMIN_PASSWORD` | `admin` / `admin123` | First admin, created on first start only |
| `DATA_DIR` | `./data` | Database file (`db.json`, plus a `.bak` copy made at each start) |
| `UPLOADS_DIR` | `./uploads` | Uploaded media |
| `MAX_UPLOAD_MB` | `50` | Upload size limit |

## What you can do

- **Websites**: create from 5 templates (Blank, Business, Product/SaaS, Portfolio, Restaurant). You can also duplicate, delete, import and export sites.
- **Visual page editor**: 18 section types, edited with a live preview (desktop, tablet and mobile). Click a section in the preview to edit it. Drag to reorder sections, or duplicate and hide them. Save with Ctrl+S.
- **Per-section styling**: color scheme, background color or image with overlay, text color, width, padding, alignment, anchor ID, CSS classes, scoped CSS (`&`), and hiding on mobile or desktop.
- **Design system per site**: 10 colors, Google Fonts, font size, line height, heading style, corner radius, button shape, shadows, content width, spacing and fade-in animations.
- **Header & menu**: 3 layouts, a logo, dropdown menus, a call-to-action button, sticky or transparent modes, and an announcement bar.
- **Footer, SEO and sharing**: meta tags, Open Graph tags, favicon, noindex, `robots.txt` and `sitemap.xml`.
- **Custom code**: CSS, JavaScript, and code injected into `<head>` or before `</body>`.
- **Media library**, **form entries** (with CSV export), **coming-soon mode** and **multiple admin users**.
- **Delivery**: each site is served at `/s/<slug>/`, or at the root of its own custom domain. It can also be exported as a **static HTML ZIP** for any host, or as a **site package (.json)** to move it to another SiteForge install.

## Architecture

The project follows clean architecture. Dependencies point inwards only.

```
src/
├── domain/                 Pure business rules: no Express, no file system
│   ├── content/            Content model: section types, settings schemas, field descriptors
│   ├── entities/           Site, Page, User, Submission (factories + invariants)
│   ├── errors.js           ValidationError, NotFoundError, ConflictError…
│   └── util.js             ids, slugify, domain cleaning
├── application/            Use cases. Depend on the domain and on ports only
│   ├── ports.js            Interfaces: repositories, MediaStorage, PasswordHasher,
│   │                       TokenService, SiteRenderer, ArchiveWriter
│   ├── services/           SiteService, PageService, AuthService, MediaService,
│   │                       SubmissionService, PublishingService
│   └── templates.js        Starter site templates
├── infrastructure/         Adapters that implement the ports
│   ├── persistence/        JSON-file document store + repositories
│   ├── storage/            Local-disk media storage
│   ├── security/           scrypt password hashing, HMAC session tokens
│   └── archive/            ZIP writer
├── presentation/
│   ├── http/               Express app, routes (thin controllers), middleware
│   └── site/               SiteRenderer: theme → CSS variables, header/footer,
│                           one renderer per section type, base stylesheet
├── config.js               Environment configuration
└── main.js                 Composition root: wires adapters into services
admin/                      Admin single-page app (vanilla ES modules, no build step)
├── js/core/                api client, DOM helpers, UI primitives, state
├── js/fields/              Schema-driven form builder (generates every editor form)
├── js/components/          live preview, media library, layout shell
└── js/views/               dashboard, pages, page editor, settings, media, forms, account
```

**Swapping infrastructure.** To move to PostgreSQL/MongoDB, S3 or another hashing scheme, implement the matching port from `application/ports.js` and change one line in `src/main.js`. Domain and application code stay untouched.

## Adding a new section type

1. **Content model**: add an entry to `src/domain/content/sectionTypes.js` with `label`, `icon`, `category`, `description`, `fields`, `defaults` and an optional `defaultStyle`.
2. **Look**: add a renderer with the same key to `src/presentation/site/blocks/index.js`, plus any CSS in `src/presentation/site/assets/site.css`.

The admin builds the editing form automatically from `fields`. The field types are `text`, `textarea`, `richtext`, `code`, `number`, `toggle`, `select`, `color`, `image`, `url`, `font`, `page`, `lines`, and `list` (lists can be nested).

Adding a site-wide setting works the same way: add a field to `src/domain/content/siteSettings.js` and use it in the renderer. Existing sites pick up the field's default automatically.

## Custom domains

Add `example.com` under **Site settings → Custom domains** and point the domain's DNS at this server. A reverse proxy such as nginx or Caddy is recommended in front for HTTPS. Requests whose `Host` matches a site's domain are served that site at `/`.
