# logs
## Why make this project?
Me personally, after HC's neighborhood ended, I just felt the need of a platform where I can log my dev process. And yap about what I've done during the video. And I dearly miss that. And other things happened in life, that made me more connected to Retro, and app that you can upload & remember your memories, however, that app has a paid tier, and it is not based in my (super unstable) home infra. So, I'm making this!

## Future changes
1. The text will be Markdown.
2. Adding image & video overlay view when users touch it.
3. Fixing the broken user page (maybe I'll work on it when I have time)
4. Remove Debug text.
5. Bring filtering to life. Including tags, and text (although the postgres index is a bit shotty). This will also include home, search and profile as well.
6. Videos should have a custom UI to it.
7. Short text previews on the home page instead of paragraphs of text taking over user's profile page, edit previews, search previews, and public feed previews.
8. Adding video encoding if possible.
9. Add more stuff that the administrator can just customize.
10. Collections, users can create collections of their trip for example. The home page and search would not include the collection searching.
11. URL Shortening. This software should have an auto url shorting thingy built right in (using /u/[slug]) or byo your own shlink server.

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

## Currently known issues
Most of the known issues are in GH issues (as a issue tracker)
But some of it I'm going to list here:
- The admin toggles will just move around for some reason
- The edit system is still broken

## Auth
You must pull the GitHub Repo in order to recompile it. This guide assumes that you've using Linux and already got bun (or npm, yarn, pnpm, deno), git and docker buildx installed.

1. Pull the project
```bash
git clone https://github.com/hpware/logs
cd logs
```

2. Go to Better-Auth config file.
```bash
nano packages/db/src/index.ts
```

3. View the Better-Auth docs [here](https://www.better-auth.com/docs/authentication/email-password), and change from the docs.

4. Modify the login page to include your link to signin.

5. Build the image
```bash
docker build . logs-hosting-custom-image
```

6. Then change your docker compose to your image.
