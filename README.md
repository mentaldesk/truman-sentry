# Truman × Sentry

> **This is a companion repository for a Sentry blog series.**
>
> It is a derivative of [mentaldesk/truman](https://github.com/mentaldesk/truman) — a real,
> running personalised news reader — copied as it stood, with every trace of Sentry
> instrumentation removed. The original repo's Sentry setup was built up over many commits
> spread across months of ordinary development, which makes it hard to read as a worked
> example. This one starts from zero and adds instrumentation one commit at a time, in the
> same order the blog posts introduce it.
>
> Each post gets a branch and a pull request:
>
> | Branch | Post |
> |---|---|
> | `blog-post-1` | Using Sentry in a .NET and Svelte app |
>
> Read the PR commit by commit and each one maps to a section of the post. `main` holds the
> starting point: Truman with no Sentry at all.
>
> For the real application, its full history and its ongoing development, go to
> [mentaldesk/truman](https://github.com/mentaldesk/truman). This copy is not deployed and
> will not track the original.

---

Your reality is defined by the sum of all the little things you choose to pay attention to.

Consciously choosing the media you consume and the sentiment it conveys allows you to take control of your reality and focus on the things that are important to you.

Truman lets you create your own personalised news feed consisting of only the things you care about, presented the way you want.

I'm running my own personal instance at [https://truman.news](https://truman.news) but ultimately that feeds up stories that are likely to be of interest to me, but not to you. If you want your own personalised feed, you can run your own instance of Truman and configure it to your liking.

### Prerequisites

- Docker Engine
- Docker Compose plugin
- a local `.env` file in the repo root (copy from `env.example`)

### Start the app

```bash
cp env.example .env
# fill in real values as needed

docker compose up --build
```

The app should then be available at:

- `http://localhost:5001/`
- `http://localhost:5001/openapi/v1.json`

### Notes

- The app container builds the frontend and serves it from the API.
- Postgres runs as a separate container with a named volume.
- Compose injects `POSTGRES_HOST=postgres` for the app container.
- This Compose path is intended for simple local/VPS deployment work or staging environments for branches/PRs.