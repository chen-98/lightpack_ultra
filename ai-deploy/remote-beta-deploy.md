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

- Server public IP: SERVER_IP
- Domain: (not yet configured)
- Deployment path: /opt/lightpack_ultra
- Branch: codex/modernization-baseline
- Commit: 3b1b380
- Current access mode: `IP HTTP`
- Date/time: 2026-05-15 10:35 CST

## Checklist

### 1. Confirm Repository State

- [x] Confirm current directory is the repository root.
- [x] Confirm branch and latest commit.
- [x] Confirm working tree status.

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

- [x] Read deployment guide.
- [x] Inspect Compose services.
- [x] Inspect Dockerfile.
- [x] Inspect Caddy example.
- [x] Inspect production config example.

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

- [x] Create `config/local.json` if missing.
- [x] Set `environment` to `production`.
- [x] Set `databaseUrl` to `mongodb://mongo:27017/lighterpack`.
- [x] Set `port` to `3000`.
- [x] Set `bindings` to `["0.0.0.0"]`.
- [x] Set `deployUrl` and `publicUrl` to the temporary IP URL or final domain URL.
- [x] Leave optional service keys empty unless real values are available.
- [x] Confirm `config/local.json` is ignored by Git.

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

- [x] Create `Caddyfile` if missing.
- [x] If domain is not ready, use the `:80` temporary block.
- [ ] If domain is ready, use the real domain block.
- [x] Confirm `Caddyfile` is ignored by Git.

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

- [x] Create backup directory.
- [x] Ensure backup script is executable.

Commands:

```sh
mkdir -p backups
chmod +x scripts/backup-mongo.sh
ls -lah scripts/backup-mongo.sh backups
```

### 6. Validate Compose Configuration

- [x] Run Compose config validation.
- [x] Stop and report if validation fails.

Command:

```sh
docker compose config
```

Expected:

- Compose renders without errors.
- No public port mapping for MongoDB or app service.

### 7. Build and Start Stack

- [x] Build and start containers.
- [x] Confirm service status.

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

- [x] Inspect app logs.
- [x] Inspect MongoDB logs.
- [x] Inspect Caddy logs.
- [x] Record any warnings or errors.

Commands:

```sh
docker compose logs --tail=160 app
docker compose logs --tail=160 mongo
docker compose logs --tail=160 caddy
```

Deprecation warnings are acceptable if services stay running. Container exits,
database connection failures, or Caddy config errors are blockers.

### 9. HTTP or HTTPS Smoke Test

- [x] Test localhost through Caddy.
- [x] Test public IP or domain.
- [x] Record HTTP status codes.

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

- [x] Run backup script.
- [x] Confirm backup file exists and is non-empty.

Commands:

```sh
bash scripts/backup-mongo.sh
ls -lah backups | tail
```

Expected:

- A file like `YYYYmmdd-HHMMSS-lighterpack.archive.gz` exists.
- File size is greater than zero.

### 12. Final Report

- [x] Summarize current branch and commit.
- [x] Summarize access URL.
- [x] Summarize Compose service status.
- [x] Summarize smoke test result.
- [x] Summarize backup result.
- [x] List remaining manual tasks.
- [x] Do not include secret values.

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
2026-05-15 10:35 CST - Started deployment. IP HTTP mode.
2026-05-15 10:38 CST - Steps 1-2 complete. Repo clean on codex/modernization-baseline@3b1b380. All deployment files verified.
2026-05-15 10:40 CST - Steps 3-5 complete. config/local.json created (IP HTTP mode). Caddyfile created (:80 block). Backup dir ready.
2026-05-15 10:41 CST - Step 6 complete. docker compose config validated. No public ports on app or mongo.
2026-05-15 10:43 CST - Step 7 complete. All three containers started and running.
2026-05-15 10:43 CST - Step 8 complete. App listening on :3000, MongoDB ready, Caddy serving HTTP. No errors.
2026-05-15 10:44 CST - Step 9 complete. curl -I http://127.0.0.1 → 200. curl -I http://SERVER_IP → 200.
2026-05-15 10:44 CST - Step 11 complete. Backup file 20260515-104402-lighterpack.archive.gz created (116 bytes, empty DB expected).
2026-05-15 10:45 CST - Step 10 pending: manual browser smoke test required by human operator.
```
