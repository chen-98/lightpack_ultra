# Remote Beta Deploy Runbook

This file is the handoff prompt and tracking checklist for the remote Codex CLI
agent running on the beta server. Update this file in place as each step is
completed so deployment progress stays visible and auditable.

## Operating Rules

- Do not modify application business code.
- Do not commit secrets, `config/local.json`, `.env`, `Caddyfile`, backups, or database files.
- Do not expose MongoDB `27017` or app port `3000` to the public internet.
- Do not run `docker compose down -v` in production.
- Use Docker Compose for `app`, `mongo`, and `caddy`.
- MongoDB runs in Docker, not as a system-level `mongod` service.
- Public access must go through Caddy on ports `80` and `443`.
- If the domain is not ready, deploy with temporary `http://SERVER_IP/`.
- When the domain is ready, switch `deployUrl`, `publicUrl`, and `Caddyfile` to the HTTPS domain.
- After each completed section, change its checkbox from `[ ]` to `[x]` and add short notes under **Execution Notes**.

## Deployment Context

Fill these in on the server:

- Server public IP:
- Domain:
- Deployment path:
- Branch:
- Commit:
- Current access mode: `IP HTTP` / `Domain HTTPS`
- Date/time:

## Checklist

### 1. Confirm Repository State

- [ ] Confirm current directory is the repository root.
- [ ] Confirm branch and latest commit.
- [ ] Confirm working tree status.

Commands:

```sh
pwd
git status --short --branch
git log --oneline --decorate -5
ls -la
```

Expected:

- Repository root contains `docker-compose.yml`, `Dockerfile`, `Caddyfile.example`, `docs/deployment.md`.
- Working tree should be clean before deployment edits, except private server files ignored by Git.

### 2. Read Deployment Files

- [ ] Read deployment guide.
- [ ] Inspect Compose services.
- [ ] Inspect Dockerfile.
- [ ] Inspect Caddy example.
- [ ] Inspect production config example.

Commands:

```sh
sed -n '1,240p' docs/deployment.md
sed -n '1,220p' docker-compose.yml
sed -n '1,180p' Dockerfile
sed -n '1,160p' Caddyfile.example
sed -n '1,160p' config/local.production.example.json
```

Expected:

- `app` does not publish `3000`.
- `mongo` does not publish `27017`.
- `caddy` publishes only `80` and `443`.
- `app` mounts `./config/local.json:/app/config/local.json:ro`.
- MongoDB has a persistent named volume.

### 3. Create Private Production Config

- [ ] Create `config/local.json` if missing.
- [ ] Set `environment` to `production`.
- [ ] Set `databaseUrl` to `mongodb://mongo:27017/lighterpack`.
- [ ] Set `port` to `3000`.
- [ ] Set `bindings` to `["0.0.0.0"]`.
- [ ] Set `deployUrl` and `publicUrl` to the temporary IP URL or final domain URL.
- [ ] Leave optional service keys empty unless real values are available.
- [ ] Confirm `config/local.json` is ignored by Git.

Commands:

```sh
test -f config/local.json || cp config/local.production.example.json config/local.json
nano config/local.json
cat config/local.json
git status --short
```

Temporary IP mode:

```json
"deployUrl": "http://SERVER_IP",
"publicUrl": "http://SERVER_IP"
```

Domain mode:

```json
"deployUrl": "https://your-domain.example.com",
"publicUrl": "https://your-domain.example.com"
```

Do not paste secret keys into this runbook.

### 4. Create Caddyfile

- [ ] Create `Caddyfile` if missing.
- [ ] If domain is not ready, use the `:80` temporary block.
- [ ] If domain is ready, use the real domain block.
- [ ] Confirm `Caddyfile` is ignored by Git.

Commands:

```sh
test -f Caddyfile || cp Caddyfile.example Caddyfile
nano Caddyfile
cat Caddyfile
git status --short
```

Temporary IP mode:

```caddy
:80 {
    reverse_proxy app:3000
}
```

Domain mode:

```caddy
your-domain.example.com {
    reverse_proxy app:3000
}
```

### 5. Prepare Backup Directory and Script

- [ ] Create backup directory.
- [ ] Ensure backup script is executable.

Commands:

```sh
mkdir -p backups
chmod +x scripts/backup-mongo.sh
ls -lah scripts/backup-mongo.sh backups
```

### 6. Validate Compose Configuration

- [ ] Run Compose config validation.
- [ ] Stop and report if validation fails.

Command:

```sh
docker compose config
```

Expected:

- Compose renders without errors.
- No public port mapping for MongoDB or app service.

### 7. Build and Start Stack

- [ ] Build and start containers.
- [ ] Confirm service status.

Commands:

```sh
docker compose up -d --build
docker compose ps
```

Expected:

- `app` is running.
- `mongo` is running.
- `caddy` is running.

### 8. Inspect Logs

- [ ] Inspect app logs.
- [ ] Inspect MongoDB logs.
- [ ] Inspect Caddy logs.
- [ ] Record any warnings or errors.

Commands:

```sh
docker compose logs --tail=160 app
docker compose logs --tail=160 mongo
docker compose logs --tail=160 caddy
```

Deprecation warnings are acceptable if services stay running. Container exits,
database connection failures, or Caddy config errors are blockers.

### 9. HTTP or HTTPS Smoke Test

- [ ] Test localhost through Caddy.
- [ ] Test public IP or domain.
- [ ] Record HTTP status codes.

Temporary IP mode:

```sh
curl -I http://127.0.0.1
curl -I http://SERVER_IP
```

Domain mode:

```sh
curl -I https://your-domain.example.com
```

Expected:

- Return `200`, `301`, or `302`.
- No `connection refused`.

### 10. Manual Browser Smoke Test

- [ ] Homepage opens.
- [ ] Register a test user.
- [ ] Add a list item.
- [ ] Refresh and confirm data remains.
- [ ] Log out and log in, then confirm data remains.
- [ ] Generate a share link.
- [ ] Open the share link.
- [ ] Export CSV.
- [ ] Import CSV.
- [ ] Open Feedback dialog and confirm mailto link.
- [ ] Add image by URL.
- [ ] If Imgur is not configured, confirm upload failure message suggests URL fallback.

Record the test username and any failed steps under **Execution Notes**.

### 11. Backup Test

- [ ] Run backup script.
- [ ] Confirm backup file exists and is non-empty.

Commands:

```sh
bash scripts/backup-mongo.sh
ls -lah backups | tail
```

Expected:

- A file like `YYYYmmdd-HHMMSS-lighterpack.archive.gz` exists.
- File size is greater than zero.

### 12. Final Report

- [ ] Summarize current branch and commit.
- [ ] Summarize access URL.
- [ ] Summarize Compose service status.
- [ ] Summarize smoke test result.
- [ ] Summarize backup result.
- [ ] List remaining manual tasks.
- [ ] Do not include secret values.

Use this format:

```text
Deployment summary:
- Branch:
- Commit:
- Access mode:
- URL:
- Docker services:
- Smoke test:
- Backup:
- Remaining tasks:
```

## Execution Notes

Append timestamped notes here as work proceeds.

```text
YYYY-MM-DD HH:mm TZ - Started deployment.
```

