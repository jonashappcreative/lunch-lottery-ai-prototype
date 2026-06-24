# Deploying to Coolify (Hetzner)

This project is a **static site**. The included `Dockerfile` builds the Vite app
and serves the result with nginx on **port 80**. Coolify builds that Dockerfile,
runs the container, and puts its reverse proxy (Traefik) in front of it with
automatic Let's Encrypt TLS.

Target domain: **`lunch-lottery.jonashapp.com`**

---

## 1. Point DNS at your server

In your DNS provider for `jonashapp.com`, add a record pointing the subdomain at
your Hetzner server's public IP:

| Type | Name            | Value                | Proxy    |
| ---- | --------------- | -------------------- | -------- |
| `A`  | `lunch-lottery` | `<your-server-IPv4>` | DNS only |

(If you use IPv6, add an `AAAA` record with the server's IPv6 too.)

Wait until `dig +short lunch-lottery.jonashapp.com` returns your server IP before
issuing the certificate in step 4 — otherwise Let's Encrypt validation fails.

---

## 2. Get the code into Git

Coolify deploys from a Git repository. Push this repo to GitHub/GitLab (or your
self-hosted Git), e.g.:

```bash
git add -A
git commit -m "Static Lunch Lottery, Coolify-ready"
git push
```

---

## 3. Create the application in Coolify

1. **Project → + New Resource → Application.**
2. Choose your Git source (GitHub App / Deploy Key / Public Repository) and select
   this repository and the branch (`main`).
3. **Build Pack: `Dockerfile`.** Coolify auto-detects the `Dockerfile` at the repo
   root — no build/start commands needed.
4. **Port:** set **Ports Exposes = `80`** (the nginx container listens on 80).
   No published host port is required; Coolify's proxy handles ingress.
5. **Environment variables:** none. The app has no backend or secrets.

---

## 4. Set the domain + TLS

1. In the application's **Domains** field, enter:

   ```
   https://lunch-lottery.jonashapp.com
   ```

   Using `https://` tells Coolify to request a Let's Encrypt certificate and
   redirect HTTP → HTTPS automatically.

2. Save.

---

## 5. Deploy

Click **Deploy**. Coolify will:

- build the Docker image (`npm ci` → `npm run build` → copy `dist/` into nginx),
- start the container,
- route `lunch-lottery.jonashapp.com` to it and provision the certificate.

When the build finishes, open <https://lunch-lottery.jonashapp.com>.

---

## Notes

- **Redeploys:** push to the branch and hit Deploy (or enable auto-deploy via
  webhook in Coolify). Each deploy rebuilds the static assets.
- **Why a Dockerfile and not "just Vite"?** Coolify needs to know how to build
  _and_ serve the app. The Dockerfile does both: a Node stage runs the Vite build,
  and an nginx stage serves the static `dist/` with SPA history fallback
  (`nginx.conf`). This is the most reliable, dependency-free way to host a static
  SPA on Coolify.
- **SPA routing:** `nginx.conf` falls back to `index.html` for unknown paths so
  deep links like `/draw` or `/history` work on refresh.
- **No persistence:** state is per-browser (`localStorage`). There is no shared or
  server-side data, by design.

---

## Local production smoke test

```bash
docker build -t lunch-lottery .
docker run --rm -p 8080:80 lunch-lottery
# open http://localhost:8080
```
