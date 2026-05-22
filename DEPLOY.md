# Deploy to Vercel (calculator.stormsprinklers.com)

## One-time setup

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. Sign in at [vercel.com](https://vercel.com) and **Add New Project**.
3. Import the repository and keep defaults:
   - **Framework:** Next.js
   - **Build command:** `npm run build`
   - **Output:** (automatic)
4. Deploy. You will get a URL like `runtime-calculator.vercel.app`.

## Custom subdomain

In Vercel → **Project → Settings → Domains**:

- Add `calculator.stormsprinklers.com` (or your preferred subdomain).

In your DNS provider (where `stormsprinklers.com` is managed):

| Type  | Name        | Value                |
|-------|-------------|----------------------|
| CNAME | calculator  | `cname.vercel-dns.com` |

Vercel will verify and issue SSL automatically.

## CLI deploy (optional)

```bash
npm i -g vercel
vercel login
vercel --prod
```

## Link from main website

Add a nav or footer link on [stormsprinklers.com](https://www.stormsprinklers.com/) pointing to the calculator URL once live.
