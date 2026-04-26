# Awork Coding Challenge — Senior Frontend Engineer

Hello! This repository is my submission for the awork senior frontend engineer coding challenge. It renders 5,000 randomly generated users grouped by a configurable criterion, with an expand-in-place detail panel, client-side search, and a fully virtualised list — built on Angular v21 with signals.

## Quick start

```bash
npm install
npm start                 # http://localhost:4200
```

## Scripts

| Script                                       | Purpose                                                                                                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `npm start`                                  | Run the dev server (hot reload).                                                                                              |
| `npm run build`                              | Production build via `@angular/build:application`. Outputs to `dist/awork-challenge`.                                         |
| `npm run watch`                              | Development build that rebuilds on change.                                                                                    |
| `npm test`                                   | Run the full Vitest suite via `@angular/build:unit-test`.                                                                     |
| `npm run test:file -- <path>`                | Run a single spec file.                                                                                                       |
| `npm run schematics:component -- --help`     | Show the custom component schematic options.                                                                                  |
| `npm run generate:component -- ...`          | Generate a feature component using the project's enforced container vs presentational layout (see `AGENTS.md` for arguments). |

Run a single spec via `make`:

```bash
make test projects/awork-challenge/src/app/users/utils/group-users/group-users.util.spec.ts
```

## Project documentation

- [`AGENTS.md`](./AGENTS.md) — architecture reference for humans and AI agents working in this repo (tech stack, folder layout, ownership, conventions).
- [`docs/evolutions/`](./docs/evolutions/) — Spec-Driven Development log. One folder per evolution, each holding three artefacts inspired by [GitHub Spec Kit](https://github.com/github/spec-kit): `spec.md` (what + why), `plan.md` (how + trade-offs, sealed at end of implementation), and an optional `summary.md` (post-implementation iteration log). Start with [`users-perf-grouping/spec.md`](./docs/evolutions/users-perf-grouping/spec.md) for the requirements behind the current users page.

## Architecture summary

```text
User browses /users
        │
        ▼
┌────────────────────┐
│ UsersComponent     │  signals: users, searchTerm, criterion, groups,
│ (container)        │           expandedUser, openGroupKeys
└────────────────────┘
        │            ┌────────────────────┐
        │  fetch ──► │ UserService        │  shareReplay'd HTTP, page cache
        │            └────────────────────┘
        │
        │ filterUsers() (main thread, sub-ms)
        ▼
┌────────────────────┐    postMessage     ┌──────────────────────────┐
│ UserGrouping       │ ─────────────────► │ user-grouping.worker.ts  │
│ Service            │ ◄───────────────── │ groupUsers() pure util   │
└────────────────────┘    UserGroup[]     └──────────────────────────┘
        │
        ▼
┌────────────────────┐
│ awk-user-group     │  CdkVirtualScrollViewport + custom
│ (one per group)    │  ExpandableVirtualScrollStrategyService
│                    │  → awk-user-row, awk-user-detail (animate.enter/leave)
└────────────────────┘
```

### Key building blocks

- **Web Worker grouping**. Grouping by alphabetical / age / nationality / gender runs off-main-thread inside `user-grouping.worker.ts`. The same `groupUsers()` pure util is reused as a synchronous fallback for tests and SSR (resolved via the `USER_GROUPING_WORKER_FACTORY` injection token).
- **Virtualised list per group**. Each `awk-user-group` mounts its own `CdkVirtualScrollViewport`, capped at 480 px tall, so opening "United States" with 700 users renders ~10 row DOM nodes at any time.
- **Custom virtual-scroll strategy**. `ExpandableVirtualScrollStrategyService` (an `@Injectable()` provided per `awk-user-group`) keeps `CdkVirtualScrollViewport` math correct when one row is expanded into a 276 px detail panel. No reliance on `cdk-experimental` autosize. Configured via `EXPANDABLE_VIRTUAL_SCROLL_STRATEGY_CONFIG`.
- **Expand-in-place animation**. The detail panel uses Angular v21's [`animate.enter` / `animate.leave`](https://angular.dev/guide/animations), no `@angular/animations` dependency.
- **Client-side search**. Debounced (~150 ms) and applied to a single shared `User[]` snapshot before grouping, so typing never re-fetches and only re-runs the worker on stable input.
- **Signals all the way down**. `WritableSignal` for state, `computed()` for derivations, `effect()` for the worker bridge. `OnPush` everywhere.
- **`NgOptimizedImage`**. Avatar (40 × 40) and detail image (128 × 128) flow through the optimised image directive.

### What changed vs. the starter

- O(N²) hotspot fixed: `nationalitiesCount` getter and `allUsers` row input deleted; counts are now computed once in the worker and surfaced as `UserGroup.count`.
- `track $index` → `track user.id` (id = `login.uuid`) for keyed list diffing.
- HTTP layer hardened: per-page `shareReplay({ bufferSize: 1, refCount: true })` cache, error path propagated to the container.
- The single user component split into **`user-row`** (compact) and **`user-detail`** (rich panel), each with its own `OnPush` lifecycle.
- New `users-toolbar` presentational component for search + counts.

### Trade-offs

- **One viewport per group**. Means 1 viewport per visible group. We picked it because the alternative (one big viewport with sticky group headers) requires a custom `cdk-experimental` strategy and broke the "click an existing group header to collapse" UX. Capping the viewport height at 480 px keeps DOM cost bounded.
- **Worker payload uses structured clone, not transferables**. At 5,000 lightweight `User` objects the clone cost is sub-10 ms — measured worse than `JSON.stringify` at this size — so the simpler API wins.
- **Expand state lives in the container**. We could have made each group own it, but centralising makes "auto-collapse the previously expanded user when a new one opens" trivial.

### Bonus points status

- Search without API calls — done (`filterUsers` util + debounced toolbar).
- Grouping criterion switcher — out of scope for this evolution; the architecture is criterion-agnostic and a switcher is documented as a follow-up evolution. The default is `nationality`.
- Pagination — out of scope; the service signature already accepts a `page` param and dedupes per page.
- Cloud preview — not deployed; the production build is a static SPA, so any static host (Vercel / Netlify / Cloudflare Pages) will serve `dist/awork-challenge` as-is.

## Tech stack

| Layer           | Tech                                                            |
| --------------- | --------------------------------------------------------------- |
| Framework       | Angular v21 (standalone components, signals)                    |
| Language        | TypeScript ~5.9 (strict mode)                                   |
| Styling         | SCSS, Bootstrap 5 breakpoints, custom `ease/` tokens            |
| State           | Angular Signals                                                 |
| HTTP            | `@angular/common/http` + RxJS (`shareReplay`)                   |
| Virtualisation  | `@angular/cdk/scrolling` + custom `VirtualScrollStrategy`       |
| Animations      | `animate.enter` / `animate.leave` (Angular v21)                 |
| Web Worker      | Plain ESM worker bundled by `@angular/build:application`        |
| Testing         | Vitest v4 + Angular `TestBed` (no `ng-mocks`)                   |
| Build           | `@angular/build:application` (esbuild)                          |
| Package manager | npm v11                                                         |
| Code generation | Custom Angular schematics (`projects/@scope/schematics`)        |

## Where to look first

- Container: `projects/awork-challenge/src/app/users/containers/users/`
- Worker + service: `projects/awork-challenge/src/app/users/services/user-grouping/`
- Pure utils + their specs: `projects/awork-challenge/src/app/users/utils/`
- Custom virtual-scroll strategy: `projects/awork-challenge/src/app/users/services/expandable-virtual-scroll-strategy/`
- Spec-driven plan for this work: [`docs/evolutions/users-perf-grouping/plan.md`](./docs/evolutions/users-perf-grouping/plan.md)
