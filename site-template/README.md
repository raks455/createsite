# {{NAME}}

This website was built with **CreateSite**. It is a standalone **TypeScript + Node.js + PostgreSQL** app. You can host it anywhere Node runs. The steps below use **Render** (hosting) and **Neon** (database), and both have free plans.

## What's inside

```
content/site.json     The site's pages, design and settings, as exported
content/media/        Images and other files, as exported
src/server.ts         Express server: renders pages, handles forms, serves media
src/db.ts             PostgreSQL schema and queries
src/content.ts        In-memory cache of the content, refreshed when it changes
src/admin.ts          /_createsite API: content sync from the builder, form entries
src/core/             The CreateSite renderer and content model (TypeScript)
render.yaml           Render Blueprint (one-click deploy)
```

On first start the server creates its tables and copies `content/` into the database. From then on everything is read from PostgreSQL:

| Table | Holds |
|---|---|
| `site_content` | Pages, sections, design, header, footer and SEO, as one JSONB row |
| `site_media` | Uploaded images and files |
| `site_submissions` | Contact-form entries |

## Run it locally

```bash
cp .env.example .env      # then paste your DATABASE_URL and pick an ADMIN_TOKEN
npm install
npm run dev               # http://localhost:3000
```

## Deploy to Render with Neon

1. **Create the database.** In [Neon](https://neon.tech), create a project, or a new database inside an existing one. Open **Connect** and copy the connection string. It looks like `postgresql://…neon.tech/neondb?sslmode=require`.
2. **Push this folder to GitHub** (or GitLab):
   ```bash
   git init && git add . && git commit -m "Initial site"
   git remote add origin https://github.com/<you>/{{SLUG}}.git
   git push -u origin main
   ```
3. **Create the service.** In [Render](https://render.com), choose **New + → Blueprint** and pick the repository. Render reads `render.yaml`. When it asks for `DATABASE_URL`, paste the Neon string. `ADMIN_TOKEN` is generated for you.
4. When the deploy is done, open the `https://{{SLUG}}.onrender.com` URL.
5. **Custom domain (optional).** In Render, go to **Settings → Custom Domains**, add your domain and create the DNS record it shows. HTTPS is automatic.

You can also skip the Blueprint and create a **Web Service** by hand. Use build command `npm install && npm run build`, start command `npm start`, and set the env vars `DATABASE_URL` and `ADMIN_TOKEN`.

## Keep editing in CreateSite

Open the site in the CreateSite builder and go to **Deploy → Connected deployment**. Enter this site's URL and its `ADMIN_TOKEN` (find it in Render under **Environment**). Then click **Push changes**, or turn on auto-sync. Content and media are sent to `/_createsite`, and the site updates within a few seconds without a redeploy.

## Form entries

Open `https://<your-site>/_createsite/` and enter the admin token. You can read, delete and download (CSV) every message sent through the site's forms.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string (Neon) |
| `ADMIN_TOKEN` | recommended | Enables `/_createsite` (sync and form entries) |
| `PORT` | no | Set by Render automatically |
| `CACHE_SECONDS` | no | How often to check the database for new content (default 5) |
