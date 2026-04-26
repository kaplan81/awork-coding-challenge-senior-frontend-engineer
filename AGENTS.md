# AGENTS.md — Project Architecture Reference

This document describes the architecture of the `awork-challenge` repository. It is intended as authoritative context for AI agents and developers working in this codebase.

---

## Infrastructure

### Tech Stack

| Layer           | Technology                                               |
| --------------- | -------------------------------------------------------- |
| Framework       | Angular v21 (standalone)                                 |
| Language        | TypeScript ~5.9 (strict mode)                            |
| Styling         | SCSS                                                     |
| State           | Angular Signals                                          |
| Routing         | `@angular/router` with lazy-loaded feature routes        |
| HTTP            | `@angular/common/http` (`HttpClient`) + RxJS             |
| Testing         | Vitest v4 via `@angular/build:unit-test` + `TestBed`     |
| Build           | `@angular/build:application` (esbuild-based)             |
| Package manager | npm v11                                                  |
| Code generation | Custom Angular Schematics (`projects/@scope/schematics`) |

### Angular Configuration

- **Application project name**: `awork-challenge` (defined in `angular.json`).
- **Component selector prefix**: `awk-` (defined in `angular.json`).
- **Default component schematic settings** (via `angular.json`): `OnPush` change detection, SCSS style, non-flat, standalone, `skipImport: true`.
- **Global error handling**: `provideBrowserGlobalErrorListeners()` is registered in `app.config.ts`.
- **HTTP**: `provideHttpClient()` is registered in `app.config.ts`.
- **SCSS include paths**: `projects/awork-challenge/src/styles` is exposed via `stylePreprocessorOptions.includePaths` so shared partials can be `@use`d without relative paths.

---

## Folder Structure

```
awork-coding-challenge-senior-frontend-engineer-repo/
├── docs/
│   └── evolutions/                  # Spec-Driven Development log (one folder per evolution)
│       ├── README.md                # SDD workflow + index of evolutions
│       └── users-perf-grouping/
│           └── plan.md              # Spec we drove the users perf + grouping work from
├── projects/
│   ├── @scope/
│   │   └── schematics/              # Custom Angular schematics for code generation
│   │       ├── package.json
│   │       ├── tsconfig.json
│   │       ├── README.md
│   │       └── src/
│   │           ├── collection.json
│   │           ├── component/       # Custom component schematic
│   │           │   ├── files/       # Template files (.ts, .html, .scss, .spec.ts)
│   │           │   ├── snippets/    # Boilerplate reference snippets
│   │           │   ├── index.ts     # Schematic entry point
│   │           │   ├── schema.json
│   │           │   └── component.enum.ts
│   │           └── utils/
│   └── awork-challenge/
│       ├── public/                  # Static assets
│       ├── tsconfig.app.json
│       ├── tsconfig.spec.json
│       ├── tsconfig.worker.json     # TS config used by `@angular/build:application` for Web Workers
│       └── src/
│           ├── main.ts              # bootstrapApplication(App, appConfig)
│           ├── styles.scss          # Global styles entry point
│           ├── styles/
│           │   └── ease/            # Shared SCSS partials (colors, mixins, reset, typography, variables)
│           ├── index.html
│           └── app/
│               ├── app/             # Core / shell feature
│               │   ├── app.config.ts
│               │   ├── app.routes.ts
│               │   ├── components/  # Presentational components scoped to the shell
│               │   ├── containers/
│               │   │   └── app/     # Root component (App)
│               │   ├── directives/
│               │   ├── enums/       # App-wide enums (breakpoints, http, html-tag…)
│               │   ├── mixins/      # Class mixins (StateMixin)
│               │   ├── mocks/       # Test mocks shared across the app
│               │   ├── models/      # App-wide TypeScript interfaces and types
│               │   ├── pipes/
│               │   ├── services/
│               │   └── utils/
│               │       ├── ng/      # Angular-specific utilities
│               │       ├── test/    # Test helpers (ng-http, is-vitest)
│               │       ├── ts/      # Pure TypeScript utilities
│               │       ├── ui-test/ # UI/DOM test helpers
│               │       └── window/  # Window/browser utilities
│               └── users/           # `users` feature (lazy-loaded)
│                   ├── users.routes.ts
│                   ├── components/  # Presentational components: user-row, user-detail, user-group, users-toolbar
│                   ├── containers/
│                   │   └── users/   # Smart `UsersComponent`
│                   ├── directives/
│                   ├── enums/       # `grouping-criterion.enum.ts`
│                   ├── mocks/
│                   ├── models/      # `user.model.ts`, `user-group.model.ts`, `grouping-{request,response}.model.ts`, `user-api.model.ts`, `user-dto.model.ts`
│                   ├── pipes/
│                   ├── services/
│                   │   ├── user/             # `UserService` (calls randomuser.me)
│                   │   └── user-grouping/    # `UserGroupingService` + `user-grouping.worker.ts`
│                   └── utils/
│                       ├── group-users/                           # Pure grouping util (used by worker + sync fallback)
│                       ├── filter-users/                          # Pure search filter
│                       └── expandable-virtual-scroll-strategy/    # CDK `VirtualScrollStrategy` for one-row expansion
├── angular.json
├── package.json
├── Makefile
└── tsconfig.json
```

> Additional features must follow the `users/` feature layout. The `awork-` prefix is **never** used for folder names since everything in this repo is awork; this applies to evolution folders, project folders, and feature folders alike.

---

## Ownership

| Area                      | Path                                              | Notes                                                                                                                            |
| ------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| App shell & global config | `projects/awork-challenge/src/app/app/`           | Root component, routes, providers, global models, mixins, enums, utils                                                           |
| Users feature             | `projects/awork-challenge/src/app/users/`         | Lazy-loaded feature; reference layout for any new feature                                                                        |
| Custom schematics         | `projects/@scope/schematics/`                     | Generates components with project-specific boilerplate; built separately                                                         |
| Global styles             | `projects/awork-challenge/src/styles.scss`        | Single entry point for global SCSS                                                                                               |
| Shared SCSS partials      | `projects/awork-challenge/src/styles/ease/`       | Imported via `@use 'ease/...'` thanks to `includePaths`                                                                          |
| Test infrastructure       | `projects/awork-challenge/src/app/app/utils/test/`| Shared helpers for Vitest + Angular TestBed (HTTP mocks, environment detection)                                                  |
| Spec-Driven evolutions    | `docs/evolutions/`                                | One subfolder per evolution. Each holds `spec.md` (what + why), `plan.md` (how + trade-offs, sealed at end of implementation), and an optional `summary.md` (post-snapshot iteration log). See SDD section below. |

### Feature Ownership Pattern

Every feature lives under `src/app/<feature-name>/` and is **self-contained**: it owns its routes, containers, components, services, models, enums, pipes, directives, mocks, and utils. Cross-feature dependencies must go through the `app/` core layer.

---

## Behaviours and Best Practices

### Component Architecture

Components are divided into two distinct types, enforced by the custom schematic:

| Type               | Flag | Purpose                                                                                     | Boilerplate                                                                          |
| ------------------ | ---- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Container**      | `c`  | Smart / page-level. Owns data fetching, state, and routing concerns.                        | Includes `#destroyRef = inject(DestroyRef)` and `WritableSignal`-based local state   |
| **Presentational** | `p`  | Dumb / reusable. Receives data via `input()`, emits events via `output()`. No side effects. | Includes typed `InputSignal` and `OutputEmitterRef`                                  |

**Containers live in `containers/`**, presentational components in `components/`. This separation is mandatory.

### Component File Naming

- Feature components are named `<name>.component.ts` (and `.html`, `.scss`, `.spec.ts`) — e.g. `users.component.ts`, `user.component.ts`.
- The root shell component is the only exception: it lives at `app/app/containers/app/app.ts` and is named `App` (no `.component.ts` suffix). Do not replicate this pattern in features.

### Generating Components

Use the custom schematic instead of the standard Angular CLI. Two npm scripts are exposed:

```bash
# Dry-run by default (preview only)
npm run schematics:component -- --project=awork-challenge --feature-path=users --component-type=c --name=my-widget

# Wrapper that disables dry-run (writes files)
npm run generate:component -- --project=awork-challenge --feature-path=users --component-type=p --name=my-widget
```

The schematic:

- Enforces the `containers/` vs `components/` directory split.
- Applies the project prefix (`awk-`).
- Overwrites templates with project-specific boilerplate (see `projects/@scope/schematics/src/component/snippets`).
- Automatically runs Vitest snapshots after generation.

To rebuild the schematic while editing it:

```bash
npm run build:fz-schematics         # one-shot build
npm run build:fz-schematics:watch   # watch mode
```

### State Management

- Use **Angular Signals** (`signal`, `computed`, `effect`) for all component state.
- For complex stateful classes, apply the **`StateMixin`** (`app/mixins/state/state.mixin.ts`). It exposes `state`, `defaultState`, `updateState`, `updateStateProp`, `resetState`, and `getStateProp`.
- Never use `mutate()` on signals; always use `set()` or `update()`.
- Keep state transformations pure and predictable.

### Change Detection

- All feature components must use `ChangeDetectionStrategy.OnPush`.
- The root `App` component is the only allowed exception (per the component guide).

### Routing

- All feature routes are **lazy-loaded** via `loadChildren` from `app.routes.ts`.
- Feature route files are named `<feature>.routes.ts` and export a `routes` constant.
- Inside a feature, individual containers are loaded with `loadComponent` (see `users.routes.ts`).
- The root routes file (`app.routes.ts`) only references features; it never imports feature internals. The default route (`''`) redirects to the primary feature (currently `users`), and `**` falls back to it as well.

### Templates

- Use native Angular control flow: `@if`, `@for`, `@switch`. Never use `*ngIf`, `*ngFor`, `*ngSwitch`.
- Use `class` bindings instead of `ngClass`.
- Use `style` bindings instead of `ngStyle`.
- Use `NgOptimizedImage` for all static `<img>` elements (not applicable to inline base64 images).
- Do not reference browser globals (e.g. `new Date()`) directly in templates.

### Services

- One responsibility per service.
- Always use `providedIn: 'root'` for singleton services.
- Use `inject()` for dependency injection; never use constructor injection.
- HTTP services should map raw API DTOs (`*-dto.model.ts` / `*-api.model.ts`) to internal domain models (`*.model.ts`) at the service boundary — see `UserService` for the canonical pattern.
- When subscribing to observables inside Angular classes, always pipe through `takeUntilDestroyed(this.#destroyRef)`.

### TypeScript

- Strict mode is enabled; all code must satisfy it.
- Avoid `any`; use `unknown` when the type is uncertain.
- Prefer type inference when the type is obvious from context.
- Private class members use the `#` prefix (native private fields), not the `private` keyword.
- Detailed conventions live under `.cursor/rules/typescript/` (identifiers, typing, variables, expressions, immutability, coercion, iterations, functions, classes, comments).

### Accessibility

- All components must pass AXE checks.
- Follow WCAG AA minimums: focus management, color contrast ratios, and ARIA attributes.

### Testing

- Test runner: **Vitest** executed through Angular's `@angular/build:unit-test` builder (configured in `tsconfig.spec.json` with `vitest/globals`).
- Test files are co-located with their source file as `*.spec.ts`.
- Snapshot testing is used; snapshots live in `__snapshots__/` next to the spec file.
- Every component spec must include a `'should match snapshot'` test using `toMatchSnapshot()`.
- Use `checkHttpRequestSuccess`, `checkHttpRequestBackendError`, and `checkHttpRequestNetworkError` helpers from `app/app/utils/test/ng-http.ts` when testing HTTP interactions.
- Run the full suite: `npm test`.
- Run a single spec file: `make test <path-to-spec-file>` (wraps `npm run test:file <path>`).

### Styling

- All component styles are written in **SCSS**.
- Component stylesheets are external files (not inline) referenced via `styleUrls` (or `styleUrl`) in the decorator.
- Global styles entry point: `projects/awork-challenge/src/styles.scss`.
- Shared SCSS partials live under `src/styles/ease/` and are imported with `@use 'ease/<partial>'` thanks to the `includePaths` configured in `angular.json`.
- Responsive breakpoints follow Bootstrap 5 breakpoints and are defined in the `BootstrapBreakpointMediaQuery` enum (`app/app/enums/breakpoints.enum.ts`).

### Spec-Driven Development

Non-trivial changes are tracked as **evolutions**, each living in its own folder under `docs/evolutions/<kebab-case-evolution-name>/`. We borrow the three-phase shape (not the tooling) from [GitHub Spec Kit](https://github.com/github/spec-kit):

| Phase         | File         | Required?                  | Purpose                                                                                                                       |
| ------------- | ------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Specify**   | `spec.md`    | Yes                        | The *what* and *why*. User stories, acceptance scenarios, must/should/could requirements, success criteria. **Tech-stack-free.** |
| **Plan**      | `plan.md`    | Yes                        | The *how*. Tech stack, architecture, file map, trade-offs. Sealed at end of implementation; closes with *Outcome & Deviations*. |
| **Iterate**   | `summary.md` | Optional, append-only      | Post-snapshot iterations: refactors and review feedback that landed *after* the plan was sealed. Each entry cites trigger, decision, touched files. |

Workflow:

1. **Specify first.** Write `docs/evolutions/<evolution-name>/spec.md` capturing user stories, acceptance scenarios and requirements. Stay tech-stack-free.
2. **Plan in `.cursor/plans/`.** While the architecture, file map and trade-offs are still moving, the live plan lives in `.cursor/plans/<evolution-name>.plan.md` and changes freely.
3. **Snapshot at implementation start.** Drop a clean copy of the plan into `docs/evolutions/<evolution-name>/plan.md`. That file becomes the contract reviewers check the implementation against.
4. **Append "Outcome & Deviations"** at implementation end so the committed `plan.md` reflects what was actually shipped, not the pre-implementation guess.
5. **Append to `summary.md`** for any change that lands *after* the plan is sealed (renames, reorganisations, style passes). The plan and the spec are never edited retroactively.
6. `docs/evolutions/README.md` indexes all evolutions and documents this workflow.

Conventions:

- Folder names use `<kebab-case>` and **omit the `awork-` prefix** since everything in this repo is awork. Same rule applies to feature/project folders.
- One evolution = one folder. Future work (e.g. a grouping-criterion switcher, pagination, deploy) gets its own folder.
- Cross-cutting refactors that touch multiple features still belong to a single evolution folder; the spec documents the cross-feature scope.
- **Spec ↔ plan separation is hard.** `spec.md` never names a framework, library or test runner; `plan.md` never argues *why* a feature exists. If you find yourself crossing the line, refactor.

This is why `docs/evolutions/` is part of the canonical folder structure above.
