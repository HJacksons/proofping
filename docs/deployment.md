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

## GitHub Secrets

Add these repository secrets in GitHub:

```text
SERVER_HOST=<SERVER_IPV4>
SERVER_USER=<ssh-user>
SERVER_SSH_KEY=<private deploy key>
```

The server user must be able to run Docker and access `~/apps/proofping`.
