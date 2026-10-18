# logs
## Why make this project?
Me personally, after HC's neighborhood ended, I just felt the need of a platform where I can log my dev process. And yap about what I've done during the video. And I dearly miss that. And other things happened in life, that made me more connected to Retro, and app that you can upload & remember your memories, however, that app has a paid tier, and it is not based in my (super unstable) home infra. So, I'm making this!

## Maintenance status

Post editing checks the signed-in owner and supports text, tags, and visibility. Search uses the original centered input with results updating as you type. Home and profile feeds accept text, exact-tag, and post-type filters through URL parameters. Feed previews render Markdown with expandable text. Collections can be created, renamed, edited, and deleted in the dashboard, populated with new or existing posts, and viewed at `/c/[slug]`; visitors only see public entries. The post editor can copy a short share link for a saved public or link-only post.

Private posts and their metadata require ownership. Media referenced by public or unlisted posts is accessible to any requester; other uploads require ownership unless used as a public profile picture. Drafts can be previewed by their owner. Public profile pictures remain public. Media streams support video seeking. Videos have play/pause, mute, seeking, an expanded dialog, and fullscreen controls. Image dialogs support Escape and keyboard focus management. Admin feature toggles save independently.

Account settings save your display name and profile picture. Password changes require the current password and sign out other sessions. The sign-in email is displayed as read-only; email changes require an email verification flow, which is not configured in this project.

See [roadmap.md](roadmap.md) for remaining product ideas.

## What does this project use?
This project uses a lot of libraries (and frameworks)
- Next.js 16
- Tailwind CSS
- Better-Auth
- Drizzle
- Postgres
- Docker
- Bun
- shadcn/ui
- Sonnar

## Development

Use Bun 1.4.2 and PostgreSQL. Copy `apps/web/.env.example` to `apps/web/.env`, set `DATABASE_URL`, `BETTER_AUTH_URL` (for local development, `http://localhost:3001`), and a random `BETTER_AUTH_SECRET` of at least 32 characters.

```bash
bun install --frozen-lockfile
bun run db:migrate
bun run dev:web
```

The first registered account becomes an administrator. Subsequent accounts are regular users. Registration can be disabled in Site Settings. Additional trusted auth origins accept comma-separated values or arrays with single or double quotes in `CORS_ORIGINS`; the original `CORS_ORIGIN` name is also supported. `CORS_ORIGINS` takes precedence when both are set. For example, `CORS_ORIGIN=['https://pub.log.yachts', 'https://logs.2oo.dev', 'https://logs.pleaseuse.me', 'https://2b6c95.a.srv.yhw.tw']` is valid in `.env`. Restart the server after changing these variables. Authentication uses same-site cookies and keeps CSRF checks enabled.

S3-compatible storage is optional for text posts. Configure the S3 variables in the example file to enable image/video uploads. `UPLOAD_LIMIT` is in MiB and defaults to 50. Keep the bucket private so media requests go through the application's visibility checks. Existing external media URLs retain the access policy of their host. If an earlier deployment cached media through a CDN or reverse proxy, purge that cache when upgrading: older responses allowed public caching for one year.

```bash
bun run check-types
bun test
bun audit
bun run build
bun start
```

`bun start` applies database migrations and starts the production web server on port 3000. The Docker image preserves the workspace layout, uses a frozen lockfile, and excludes local environment files. Supply runtime environment variables when starting the container.

The lockfile updates Next.js to 16.4.2, React to 19.3.1, and Better Auth to 1.7.10. An esbuild override patches the older transitive version used by Drizzle Kit. Fonts are bundled locally so builds do not fetch Google Fonts.

## Integration tests

`bun test` runs validation tests; API integration tests are enabled only when `TEST_BASE_URL` is set. Use a **fresh, migrated test database** and a server configured with that database; the suite creates users, posts, and collections and expects the first user to be the administrator.

```bash
# Terminal 1: configure DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL
# for the isolated test instance before starting it.
bun run db:migrate
bun run dev:web

# Terminal 2:
TEST_BASE_URL=http://localhost:3001 bun test
```

Integration coverage includes forged-author edits, anonymous access, private uploads, collection editing and ownership, combined text/tag/type filters, share redirects, administrator toggles, display-name updates, and password changes/session revocation. Markdown rendering tests check formatting, escaped HTML, and unsafe link protocols. Live S3 uploads require a configured storage service and are not covered by this suite.
