LighterPack
===========
LighterPack helps you track the gear you bring on adventures.

Fork status
-----------

This fork is currently maintained for beta release work. For support, bug
reports, or beta feedback, contact 920158928@qq.com.

Based on LighterPack by Galen Maly and contributors. This fork keeps the
project under the GPL-2.0 license.

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

Migrating from original LighterPack
-----------------------------------

For the beta migration path, move one list at a time with CSV:

1. Open the list in the original LighterPack site.
2. Export the list to CSV.
3. In this fork, click Import CSV.
4. Review the preview and import the list.

The CSV importer preserves item name, category, description, quantity, weight,
unit, URL, price, worn, and consumable values from the original CSV export.
Current migration is limited to a single list CSV. It does not migrate accounts,
images, multiple lists at once, or remote login state. Images can be added later
through an image URL or upload.

Useful commands:

```sh
npm run build
npm run check
npm run test:e2e:smoke
npm run test:e2e:chromium
npm run test:e2e
```

Testing expectations:

- Run the smallest relevant command first: a focused unit test, `npm run test:unit`, or `npm run check`.
- Run `npm run check` before each commit or small batch of related commits.
- Run `npm run test:e2e:smoke` when you need a quick browser/server sanity check.
- Run `npm run test:e2e:chromium` when changing user workflows, drag/drop behavior, routing, authentication, sharing, or layout that can affect interactions.
- Run full `npm run test:e2e` before release or when a change is browser-specific and needs both Chromium and Firefox coverage.
- If Playwright reports missing browsers, run `npm run test:e2e:install`.
- End-to-end tests require MongoDB on `localhost:27017`.

Note: this project currently uses an older Webpack toolchain. The npm scripts pass
`--openssl-legacy-provider` so the app can run on modern Node.js versions that use
OpenSSL 3+.

Future non-feature initiatives
-----------
- Migrate to postgres document store from mongo
