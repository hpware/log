# logs
## Why make this project?
Me personally, after HC's neighborhood ended, I just felt the need of a platform where I can log my dev process. And yap about what I've done during the video. And I dearly miss that. And other things happened in life, that made me more connected to Retro, and app that you can upload & remember your memories, however, that app has a paid tier, and it is not based in my (super unstable) home infra. So, I'm making this!

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

4. Build the image
```bash
docker build . logs-hosting-custom-image
```

5. Then change your docker compose to your image.
