LighterPack
===========
LighterPack helps you track the gear you bring on adventures.

Project planning
----------------

Modernization and feature planning lives in [docs/modernization-plan.md](docs/modernization-plan.md).
Traceable change records live in [docs/change-log.md](docs/change-log.md).

Development setup
-----------------

Prerequisites:

- Node.js and npm
- MongoDB

Install dependencies:

```sh
npm install
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

Note: this project currently uses an older Webpack toolchain. The npm scripts pass
`--openssl-legacy-provider` so the app can run on modern Node.js versions that use
OpenSSL 3+.

Future non-feature initiatives
-----------
- Migrate to postgres document store from mongo
