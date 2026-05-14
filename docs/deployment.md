# Docker Compose Deployment

This deployment is intended for a small beta server with Docker and the Docker
Compose plugin already installed. The public firewall only needs ports 22, 80,
and 443 open. MongoDB stays on the Docker network and is not published to the
host.

## Architecture

| Service | Purpose | Public ports |
| --- | --- | --- |
| `caddy` | HTTP/HTTPS entrypoint and reverse proxy to `app:3000` | `80`, `443` |
| `app` | Node/Express LighterPack app | none |
| `mongo` | MongoDB data store | none |

MongoDB data is stored in the named Docker volume `mongo_data`. Caddy uses
`caddy_data` and `caddy_config` for certificates and runtime state. Backups are
written to the host `./backups` directory.

## First Deploy

From the repository root on the server:

```sh
cp config/local.production.example.json config/local.json
cp Caddyfile.example Caddyfile
mkdir -p backups
```

Edit `config/local.json` before starting the stack:

- Keep `"environment": "production"`.
- Keep `"port": 3000` and `"bindings": ["0.0.0.0"]`.
- Keep `"databaseUrl": "mongodb://mongo:27017/lighterpack"`.
- While the domain is not ready, set `deployUrl` and `publicUrl` to
  `http://SERVER_IP`. After DNS is ready, change both values to the real
  `https://` domain.
- Fill `imgurClientID` and Mailgun values only if those services are used.
- Do not commit `config/local.json`; it contains production-only settings.

Edit `Caddyfile` and choose one active site block:

- Domain not ready: the default `:80` block can be used directly for temporary
  `http://SERVER_IP/` testing.
- Domain ready: switch to the real domain block, then update `deployUrl` and
  `publicUrl` in `config/local.json` to the `https://` domain. Caddy will enable
  HTTPS automatically after DNS is valid.

Start the stack:

```sh
docker compose up -d --build
docker compose ps
```

Follow logs during the first boot:

```sh
docker compose logs -f app caddy mongo
```

## Updates

Pull or deploy the new repository revision, then rebuild only what changed:

```sh
docker compose up -d --build
docker compose ps
```

The `mongo_data`, `caddy_data`, and `caddy_config` volumes are preserved across
container rebuilds.

## Backups

Create an on-demand MongoDB backup from the host:

```sh
bash scripts/backup-mongo.sh
```

By default this writes `./backups/YYYYmmdd-HHMMSS-lighterpack.archive.gz`.
Override the database name or output directory if needed:

```sh
DB_NAME=lighterpack BACKUP_DIR=/srv/lighterpack-backups bash scripts/backup-mongo.sh
```

Copy backups off the server before risky deploys. A backup archive can be
restored into the Compose MongoDB container with `mongorestore --archive --gzip`
after choosing the exact restore target.

## Rollback

For a low-risk rollback:

1. Record the current commit with `git rev-parse --short HEAD`.
2. Confirm a fresh backup exists in `./backups`.
3. Check out the previous known-good commit.
4. Run `docker compose up -d --build`.
5. Check `docker compose logs -f app caddy`.

Container rebuilds do not remove MongoDB data. Do not run `docker compose down
-v` in production unless you intentionally want to delete named volumes.

## Operational Notes

- Do not add `ports: ["3000:3000"]` to `app` for normal production use. If a
  temporary direct-app debug port is needed, bind it only to localhost and remove
  it afterward.
- Do not publish `27017:27017`; MongoDB must remain private to the Compose
  network.
- Keep real secrets in `config/local.json` or the server environment, not in the
  image or Git.
- Use `docker compose restart app` for a simple app restart without rebuilding.
