# Upstream GitHub User Research

> Source: [galenmaly/lighterpack](https://github.com/galenmaly/lighterpack). Refreshed on 2026-05-13 15:14:14 +08:00 via the GitHub Issues and Pull Requests API.
>
> Snapshot: 154 issues, 85 open issues, 90 pull requests, 31 open pull requests.

## Executive Summary

The strongest user signal is not a single missing feature. It is loss of trust in the core service: users are worried that lists do not save reliably, images stop uploading, the project is hard to run locally, and useful fixes remain unmerged for long periods. These signals should keep "data safety and service reliability" ahead of larger product expansion.

The second tier of demand is about ownership and reuse. Users want to export or integrate their data, keep a master gear inventory, reuse kits or categories across lists, and avoid re-entering the same gear. The third tier is model clarity: quantity, worn weight, consumables, fractional quantities, and summaries are useful but currently ambiguous in edge cases.

Our fork has already started addressing the most urgent reliability and workflow gaps with save-flow hardening, image-upload error handling, empty-item filtering, quick entry, gear tags, weight insights, and added-gear sidebar state. The remaining high-value direction is to keep tightening the reliability test chain, then add data portability and stronger gear reuse primitives.

## Priority Map

| Priority | Theme | User pain | Product demand | Evidence |
| --- | --- | --- | --- | --- |
| P0 | Save and service reliability | Users cannot trust that edits persist or that shared-list actions are safe. | Fail loudly, retry safely, test persistence end to end, and make save state visible. | [#229](https://github.com/galenmaly/lighterpack/issues/229), [#224](https://github.com/galenmaly/lighterpack/issues/224) |
| P0 | Image upload reliability | Image upload has repeatedly broken, including different browsers and image types. | Clear upload errors, provider isolation, fallback strategy, and test coverage for upstream failure modes. | [#235](https://github.com/galenmaly/lighterpack/issues/235), [#233](https://github.com/galenmaly/lighterpack/issues/233), [#232](https://github.com/galenmaly/lighterpack/issues/232) |
| P0 | Maintainability and deployment | Contributors struggle to build or deploy the app because the runtime stack is old. | Documented local setup, modern dependency baseline, Docker/dev environment that works for new contributors. | [#237](https://github.com/galenmaly/lighterpack/issues/237), [#142](https://github.com/galenmaly/lighterpack/pull/142), [#196](https://github.com/galenmaly/lighterpack/pull/196) |
| P1 | Data ownership and integration | Users want backups, complete exports, and machine-readable list data. | Complete export with images, stable JSON endpoint, CSV field completeness, and migration-safe schemas. | [#198](https://github.com/galenmaly/lighterpack/issues/198), [#112](https://github.com/galenmaly/lighterpack/issues/112), [#79](https://github.com/galenmaly/lighterpack/issues/79), [#183](https://github.com/galenmaly/lighterpack/issues/183) |
| P1 | Gear reuse and inventory | Users maintain recurring gear across trips and want updates to propagate. | Master gear library, reusable kits/categories, copied list hygiene, and clear added-state in the sidebar. | [#161](https://github.com/galenmaly/lighterpack/issues/161), [#217](https://github.com/galenmaly/lighterpack/issues/217), [#234](https://github.com/galenmaly/lighterpack/issues/234) |
| P1 | Weight model clarity | Quantity, worn, consumable, spare, and fractional values create confusing totals. | Explicit semantics, clearer UI labels, better rounding, and tests for representative backpacking cases. | [#244](https://github.com/galenmaly/lighterpack/issues/244), [#242](https://github.com/galenmaly/lighterpack/issues/242), [#211](https://github.com/galenmaly/lighterpack/issues/211), [#74](https://github.com/galenmaly/lighterpack/issues/74) |
| P2 | Editing ergonomics | Small repetitive actions create friction and noisy data. | Empty-item prevention, Enter-to-add, easier sorting/filtering, mobile/responsive polish. | [#177](https://github.com/galenmaly/lighterpack/pull/177), [#152](https://github.com/galenmaly/lighterpack/pull/152), [#209](https://github.com/galenmaly/lighterpack/pull/209), [#226](https://github.com/galenmaly/lighterpack/issues/226) |
| P2 | Planning and advanced trip modeling | Users want to distribute weight, model food, volume, group gear, and checklist state. | Trip-plan layer after core list data is reliable and portable. | [#240](https://github.com/galenmaly/lighterpack/issues/240), [#113](https://github.com/galenmaly/lighterpack/issues/113), [#12](https://github.com/galenmaly/lighterpack/issues/12), [#85](https://github.com/galenmaly/lighterpack/issues/85), [#24](https://github.com/galenmaly/lighterpack/issues/24) |

## User Pain Points and Demand Signals

### 1. Save and Service Reliability

Users report that new lists, imported CSV data, or subsequent edits can appear to work but disappear after refresh. [#229](https://github.com/galenmaly/lighterpack/issues/229) is the clearest example: list creation and CSV import did not persist, and later comments indicate the issue still affected real usage in 2025. [#224](https://github.com/galenmaly/lighterpack/issues/224) adds another risky path: after generating a share URL, later edits may stop saving.

This is the most painful category because it undermines the main promise of the app. A lighterpack list is a source of planning truth; silent or unclear save failure is worse than a missing feature because users may make packing decisions from stale data.

What we can solve:

- Make save success and save failure explicit in the UI.
- Keep local pending changes when server persistence fails.
- Retry safely without overwriting newer local edits.
- Add API-level failure tests and browser-level persistence tests.
- Establish a local MongoDB-backed E2E path so persistence regressions are caught before release.

### 2. Image Upload Reliability

Image upload has a recurring failure pattern. [#232](https://github.com/galenmaly/lighterpack/issues/232) points at Imgur upstream/API failure. [#233](https://github.com/galenmaly/lighterpack/issues/233) shows users confirming failures across browser and file type combinations. [#235](https://github.com/galenmaly/lighterpack/issues/235) reports the problem recurring again from 2024 onward, with later comments asking whether there is any workaround.

This is painful because image attachment is one of the few rich gear metadata features. When it fails, users do not know whether the problem is local validation, network, authentication, provider outage, or app maintenance.

What we can solve:

- Separate local validation errors from upstream provider errors.
- Avoid generic "upload failed" states.
- Make missing configuration and invalid upstream responses visible to the user.
- Abstract the image provider enough that Imgur can be replaced or bypassed later.
- Add tests for no file, unsupported type, missing provider config, upstream rejection, invalid JSON, and network failure.

### 3. Build, Deployment, and Maintenance Confidence

[#237](https://github.com/galenmaly/lighterpack/issues/237) shows that the old runtime baseline makes the project hard to build. [#142](https://github.com/galenmaly/lighterpack/pull/142) and [#196](https://github.com/galenmaly/lighterpack/pull/196) are Docker/deployment-oriented pull requests that try to lower that barrier. Several stale but useful pull requests, such as [#169](https://github.com/galenmaly/lighterpack/pull/169), [#177](https://github.com/galenmaly/lighterpack/pull/177), [#152](https://github.com/galenmaly/lighterpack/pull/152), and [#209](https://github.com/galenmaly/lighterpack/pull/209), also indicate that contributors can identify fixes but are not seeing timely integration.

This matters because reliability problems become harder to solve when the project cannot be built, tested, and reviewed easily.

What we can solve:

- Keep `npm run check` meaningful and cheap.
- Maintain documented setup and test expectations.
- Prefer small commits with explicit validation.
- Continue extracting risky behavior into testable functions before larger rewrites.
- Keep E2E setup reproducible, especially for persistence and drag/drop flows.

### 4. Data Ownership and Integration

Users ask for better ways to get data out of the system. [#198](https://github.com/galenmaly/lighterpack/issues/198) asks for complete database export including pictures, which is both a backup and self-hosting need. [#112](https://github.com/galenmaly/lighterpack/issues/112) asks for list JSON so external tools can consume shared lists. [#79](https://github.com/galenmaly/lighterpack/issues/79) and [#183](https://github.com/galenmaly/lighterpack/issues/183) point at CSV/export completeness and anonymous-list export needs.

This is a high-leverage follow-up after save and image reliability. If users can export everything, the perceived risk of using the service drops significantly.

What we can solve:

- Define a versioned library/list export shape.
- Add JSON export for current list and whole library.
- Extend CSV export only where it remains a good fit.
- Include image references first; later support packaged image export if storage makes it practical.
- Add contract tests so export fields do not silently drift.

### 5. Gear Reuse, Inventory, and Kits

[#161](https://github.com/galenmaly/lighterpack/issues/161) is one of the strongest feature signals by reactions: users want a master gear library where item updates can propagate across lists. [#217](https://github.com/galenmaly/lighterpack/issues/217) asks for drag/drop categories with associated gear. [#234](https://github.com/galenmaly/lighterpack/issues/234) asks for embedded lists, such as reusable first-aid or repair kits.

The core pattern is clear: experienced users do not think only in single lists. They think in reusable inventory, trip-specific loadouts, kits, and variations.

What we can solve:

- Keep improving the sidebar as a real library, not just a copy source.
- Mark already-added gear clearly to avoid duplicate mistakes.
- Add reusable kit/category templates after the data model is stable.
- Later, distinguish copied gear from linked inventory gear so users can choose whether updates propagate.

### 6. Weight Model and Quantity Semantics

Weight semantics are a recurring source of confusion. [#244](https://github.com/galenmaly/lighterpack/issues/244) describes the common case of one worn item plus one spare packed item. [#211](https://github.com/galenmaly/lighterpack/issues/211) and [#74](https://github.com/galenmaly/lighterpack/issues/74) show that quantity greater than one with worn items has long been ambiguous. [#242](https://github.com/galenmaly/lighterpack/issues/242) is a smaller but concrete precision issue around fractional quantities.

This is a product-model issue more than a UI-only issue. Users need the app to match backpacking language: worn, packed, consumable, spare, per-day food, group gear, and base weight all mean different things.

What we can solve:

- Document current quantity/worn/consumable rules in the UI or help text.
- Round fractional totals in display while preserving precise stored values.
- Add tests for quantity, worn quantity, consumable quantity, and mixed worn/spare cases.
- Consider an explicit "worn quantity" or "packed quantity" model only after compatibility risks are mapped.

### 7. Editing Ergonomics and List Cleanliness

[#177](https://github.com/galenmaly/lighterpack/pull/177), [#152](https://github.com/galenmaly/lighterpack/pull/152), and [#150](https://github.com/galenmaly/lighterpack/issues/150) all point at empty-item noise. [#209](https://github.com/galenmaly/lighterpack/pull/209) asks for Enter-to-add. [#226](https://github.com/galenmaly/lighterpack/issues/226) asks to hide or filter zero-quantity items. [#11](https://github.com/galenmaly/lighterpack/issues/11) and [#231](https://github.com/galenmaly/lighterpack/issues/231) represent sorting and unit-summary polish.

These are not as risky as save failures, but they are high-frequency irritants. They should be handled as small, testable improvements.

What we can solve:

- Keep empty items out of stats, saves, exports, and sidebar results.
- Continue supporting keyboard-first entry.
- Add filter states for zero quantity or excluded gear.
- Improve list sorting without changing saved data unexpectedly.

### 8. Trip Planning and Advanced Packing Models

[#240](https://github.com/galenmaly/lighterpack/issues/240) asks to distribute gear across backpacks. [#113](https://github.com/galenmaly/lighterpack/issues/113) and related group-gear requests point at shared trips. [#12](https://github.com/galenmaly/lighterpack/issues/12) asks for food values, [#85](https://github.com/galenmaly/lighterpack/issues/85) asks for volume, and [#24](https://github.com/galenmaly/lighterpack/issues/24) asks for checklist state.

These are valid product directions, but they depend on a reliable base list model. They should come after save reliability, export, and gear reuse because they expand the data model and increase migration risk.

## Current Fork Coverage

Already started or covered:

- Save flow hardening and visible save status.
- Image upload validation and clearer error handling.
- Empty item filtering in stats, save, share, CSV, and sidebar paths.
- Gear tags and sidebar filtering.
- Quick entry shortcuts.
- Weight insights and enhanced shared-list summary.
- Gear sidebar state for items already added to the current list.
- Category-name default tag backfill.

Still open:

- Full local E2E persistence chain with MongoDB in the standard validation path.
- Complete export or backup, especially with images.
- Stable JSON endpoint for list or library data.
- True master inventory with optional linked updates.
- Reusable kits, embedded lists, or reusable categories.
- Quantity/worn/consumable semantics redesign.
- Group packing, food planning, checklist state, and volume modeling.

## Recommended Next Direction

1. Finish the reliability test chain.
   Make save, load, share, and image-upload failure paths reproducible in automated tests. This is the foundation for every later feature.

2. Add data ownership features.
   Start with JSON export and contract tests, then evaluate complete backup with image references or packaged assets.

3. Evolve the gear sidebar into a real inventory surface.
   The added-state work is a useful first step. The next step is reusable kits/categories, followed by explicit linked-versus-copied inventory behavior.

4. Clarify weight semantics before changing the model.
   Write tests and user-facing rules for current behavior first. Only then consider schema changes for worn quantity, packed quantity, or trip/group assignments.

5. Keep polishing frequent editing workflows.
   Keyboard entry, empty-row hygiene, zero-quantity filters, and sorting all have strong evidence and low conceptual risk if kept small.
