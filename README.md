LighterPack
===========
LighterPack helps you track the gear you bring on adventures.

Project planning
----------------

Before making product or code changes, review [docs/working-agreement.md](docs/working-agreement.md).
Modernization and feature planning lives in [docs/modernization-plan.md](docs/modernization-plan.md).
Product philosophy and feature review guidance lives in [docs/product-philosophy.md](docs/product-philosophy.md).
Architecture context lives in [docs/architecture-notes.md](docs/architecture-notes.md).
Long-lived decisions live in [docs/decision-records.md](docs/decision-records.md).
Traceable change records live in [docs/change-log.md](docs/change-log.md).

Development setup
-----------------

Prerequisites:

- Node.js and npm
- MongoDB

Install dependencies:

```sh
npm install
npm run test:e2e:install
```

Create local configuration when needed:

```sh
cp config/local.example.json config/local.json
```

Start MongoDB, then run the development server:

```sh
mongod
npm run dev
```

Open http://localhost:8080.

Useful commands:

```sh
npm run build
npm run check
npm run test:e2e
```

Testing expectations:

- Run `npm run check` before each commit or small batch of related commits.
- Run `npm run test:e2e` when changing user workflows, drag/drop behavior, routing, authentication, sharing, or layout that can affect interactions.
- If Playwright reports missing browsers, run `npm run test:e2e:install`.

Note: this project currently uses an older Webpack toolchain. The npm scripts pass
`--openssl-legacy-provider` so the app can run on modern Node.js versions that use
OpenSSL 3+.

Future non-feature initiatives
-----------
- Migrate to postgres document store from mongo
