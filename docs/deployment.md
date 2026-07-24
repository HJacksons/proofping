# ProofPing Production Deployment

Production is designed to run on the existing ChildSafe Hetzner server:

- Docker Compose runs PostgreSQL and the Next.js app.
- The app joins the existing ChildSafe Docker network so the existing Caddy container can proxy to it.
- Caddy serves `getproofping.com`, redirects `www`, and issues HTTPS certificates automatically.
- GitHub Actions deploys every push to `main` by SSHing into the Hetzner server.

## DNS

Point these records at the Hetzner server public IPv4:

```text
A  @    <SERVER_IPV4>
A  www  <SERVER_IPV4>
```

HTTPS may show as unavailable until DNS reaches the server and Caddy obtains the certificate.

## Server Bootstrap

Run once on the server:

```bash
sudo apt-get update
sudo apt-get install -y git ca-certificates curl

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

. /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $VERSION_CODENAME stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker "$USER"
```

Log out and back in after adding the user to the `docker` group.

Then clone the app:

```bash
mkdir -p ~/apps
cd ~/apps
git clone https://github.com/HJacksons/proofping.git
cd proofping
cp .env.production.example .env
```

Edit `.env` on the server and set real production values.

Start manually once:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Add these blocks to the existing ChildSafe server Caddyfile, then reload Caddy:

```caddyfile
getproofping.com {
  reverse_proxy proofping-app:3000
}

www.getproofping.com {
  redir https://getproofping.com{uri}
}
```

```bash
docker exec childsafe-caddy caddy reload --config /etc/caddy/Caddyfile
```

## Required `.env`

Production needs at least:

```env
POSTGRES_USER=proofping
POSTGRES_PASSWORD=replace-with-a-strong-db-password
POSTGRES_DB=proofping
DATABASE_URL=postgresql://proofping:replace-with-a-strong-db-password@proofping-postgres:5432/proofping?schema=public
APP_URL=https://getproofping.com
ENABLE_DEMO_AUTH=false
AUTH_SECRET=replace-with-a-long-random-secret-at-least-32-characters
AUTH_LINK_DELIVERY=email
ADMIN_EMAIL=your-admin-email@example.com
RESEND_API_KEY=re_...
EMAIL_FROM=ProofPing <hello@getproofping.com>
```

Stripe and OpenAI are optional. If missing, the app shows disabled states.

### Donations (Stripe)

The Donate button appears when a secret key + donation price are set.
Production prefers `LIVE_STRIPE_*`; `STRIPE_*` still works as fallback.

```env
LIVE_STRIPE_SECRET_KEY=sk_live_...
LIVE_STRIPE_PRICE_DONATION=price_...
LIVE_STRIPE_PRICE_URGENT_BOOST=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

1. Stripe Dashboard (Live mode) → create one-time Prices → copy `price_...`
2. Put live secret in `LIVE_STRIPE_SECRET_KEY`
3. Developers → Webhooks / Event destinations → **Your account**
4. Selected events → search `checkout` → enable **`checkout.session.completed`**
5. Destination type: **Webhook endpoint**
6. URL: `https://getproofping.com/api/payments/webhook`
7. Copy signing secret `whsec_...` → `STRIPE_WEBHOOK_SECRET`
8. Restart containers after editing `.env`
9. Sign in → Donate / boost → confirm webhook delivery in Stripe

Urgent boost needs `LIVE_STRIPE_PRICE_URGENT_BOOST` the same way.

## GitHub Secrets

Add these repository secrets in GitHub:

```text
SERVER_HOST=<SERVER_IPV4>
SERVER_USER=<ssh-user>
SERVER_SSH_KEY=<private deploy key>
```

The server user must be able to run Docker and access `~/apps/proofping`.
If these secrets are not configured, GitHub Actions still runs build checks but
skips the deploy step; the server-side autodeploy timer can continue deploying
from `origin/main`.

## Current Server Automation

The Hetzner server also has a `proofping-autodeploy.timer` systemd timer. It
checks `origin/main` every 2 minutes from `/home/deploy/apps/proofping`, backs up
the ProofPing database before new deploys, rebuilds the containers, and verifies
`/api/health`.

Useful commands:

```bash
systemctl status proofping-autodeploy.timer
systemctl start proofping-autodeploy.service
journalctl -u proofping-autodeploy.service -n 100 --no-pager
```
