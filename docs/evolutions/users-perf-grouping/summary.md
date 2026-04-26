# Users — Performance + Grouping · Post-Implementation Iterations

This document is the running log of changes the team applied **after** [`plan.md`](./plan.md) shipped. The plan is a frozen moment-in-time snapshot of the original spec and what landed against it; this file captures every subsequent revision driven by code review.

Each section below maps to a single review prompt, in chronological order. The diff is summarised — read the file paths it points to for the canonical state.

---

## 1. `static readonly` for class constants; `readonly` only on `static`

**Trigger** — `user-group.component.ts` declared five module-scope `const`s above the class, and several files used `readonly` on instance properties.

**Decision** — Class-level constants are owned by the class as `static readonly`. The `readonly` keyword is otherwise reserved for `static` properties; instance properties never carry it.

**Touched files**

- `users/components/user-group/user-group.component.ts` — moved `COLLAPSED_ROW_PX`, `EXPANDED_ROW_PX`, `MIN_BUFFER_PX`, `MAX_BUFFER_PX`, `VIEWPORT_MAX_HEIGHT` into the class as `static readonly`.
- `users/components/users-toolbar/users-toolbar.component.ts`
- `users/containers/users/users.component.ts`
- `users/services/user-grouping/user-grouping.service.ts`
- `users/services/user/user.service.ts` (kept its three pre-existing `static readonly` constants)
- `users/utils/expandable-virtual-scroll-strategy/expandable-virtual-scroll-strategy.ts` (still in `utils/` at this stage)
- `app/containers/app/app.ts`

**Verification** — full Vitest suite green (95 tests).

---

## 2. Data models live in dedicated `.model.ts` files

**Trigger** — `AgeBucket` was declared inline at the top of `group-users.util.ts`.

**Decision** — Every domain interface goes under `users/models/<name>.model.ts`. Utility, service, and component files import from there.

**Touched files**

- `users/models/age-bucket.model.ts` — new; extracted from `group-users.util.ts`.
- `users/models/pending-grouping-request.model.ts` — new; extracted from `user-grouping.service.ts` (interface renamed `PendingRequest` → `PendingGroupingRequest` to be unambiguous outside its original file).
- `users/models/expanded-user-state.model.ts` — new; extracted from `users.component.ts`.
- Corresponding source files updated to import from the new model files.

---

## 3. Class member order: `static readonly` → `#private` → `public`

**Trigger** — `expandable-virtual-scroll-strategy.ts` declared its public `scrolledIndexChange` before private fields.

**Decision** — Inside any class, members are ordered:

1. `static readonly` (alphabetised)
2. `#private` instance members (alphabetised)
3. Public instance members (in a meaningful order — inputs, then outputs, then derived state, etc.)

**Touched files**

- `users/utils/expandable-virtual-scroll-strategy/expandable-virtual-scroll-strategy.ts` (still in `utils/` at this stage).
- `users/components/users-toolbar/users-toolbar.component.ts` — also promoted its `SEARCH_DEBOUNCE_MS` module constant to `static readonly` to keep the rule consistent.

---

## 4. `CONSTANT_CASE` reserved for `InjectionToken` only

**Trigger** — `users-toolbar.component.ts` declared `static readonly SEARCH_DEBOUNCE_MS = 150`.

**Decision** — `CONSTANT_CASE` is allowed only for Angular `InjectionToken`s (per `.cursor/rules/typescript/ts-identifiers.mdc`). All other identifiers — including `static readonly` class properties and module-scope test constants — use `lowerCamelCase`.

**Touched files**

- `users/components/users-toolbar/users-toolbar.component.ts` — `SEARCH_DEBOUNCE_MS` → `searchDebounceMs`.
- `users/components/user-group/user-group.component.ts` — `COLLAPSED_ROW_PX` → `collapsedRowPx`, `EXPANDED_ROW_PX` → `expandedRowPx`, `MIN_BUFFER_PX` → `minBufferPx`, `MAX_BUFFER_PX` → `maxBufferPx`, `VIEWPORT_MAX_HEIGHT` → `viewportMaxHeight`. Dropped a now-redundant unused `viewportMaxHeight` instance alias.
- `users/utils/expandable-virtual-scroll-strategy/expandable-virtual-scroll-strategy.spec.ts` — module-level test constants `COLLAPSED`, `EXPANDED`, `MIN_BUFFER`, `MAX_BUFFER` renamed to `collapsed`, `expanded`, `minBuffer`, `maxBuffer` (31 references updated).

`USER_GROUPING_WORKER_FACTORY` and the imported `VIRTUAL_SCROLL_STRATEGY` remain `CONSTANT_CASE` — they are injection tokens and explicitly carved out of the rule.

---

## 5. `utils/` only holds utility functions; the strategy becomes a service

**Trigger** — `ExpandableFixedSizeVirtualScrollStrategy` was a stateful class living in `users/utils/`.

**Decision** — Folders named `utils/` are reserved for pure utility functions. Stateful classes that satisfy a framework contract (here CDK's `VirtualScrollStrategy`) become Angular services. Pure functions are not viable for CDK's `attach`/`detach`/`onContentScrolled` lifecycle.

**Touched files**

- `users/services/expandable-virtual-scroll-strategy/expandable-virtual-scroll-strategy.service.ts` — new file. `@Injectable()`, no `providedIn` (per-component scope, declared in `UserGroupComponent.providers`). Configuration injected via the new `EXPANDABLE_VIRTUAL_SCROLL_STRATEGY_CONFIG` token. Class renamed `ExpandableFixedSizeVirtualScrollStrategy` → `ExpandableVirtualScrollStrategyService` to match the project's `…Service` convention.
- `users/services/expandable-virtual-scroll-strategy/expandable-virtual-scroll-strategy.service.spec.ts` — moved from `utils/`. Now constructs the strategy through `TestBed.configureTestingModule` + `TestBed.inject`, mirroring the `user-grouping.service.spec.ts` pattern.
- `users/models/expandable-virtual-scroll-strategy-config.model.ts` — new; describes the four numeric knobs (`collapsedItemSize`, `expandedItemSize`, `minBufferPx`, `maxBufferPx`).
- `users/components/user-group/user-group.component.ts` — `providers` rewritten to provide the config (`useValue`), the service itself, and `VIRTUAL_SCROLL_STRATEGY` via `useExisting`. `#strategy` now injects `ExpandableVirtualScrollStrategyService` directly (no more cast through the CDK token).
- Old `users/utils/expandable-virtual-scroll-strategy/` folder and its two files deleted.
- `README.md` updated (architecture diagram, building blocks, "Where to look first" path).

**Verification** — full Vitest suite + `ng build` both green.

---

## 6. Documentation log + dead `.gitkeep` cleanup

**Trigger** — Decided to keep an iteration trail beside the plan, and to retire `.gitkeep` files in folders the implementation has populated with real content.

**Touched files**

- `docs/evolutions/users-perf-grouping/summary.md` — this document.
- Removed `.gitkeep` from `users/enums/` (now hosts `grouping-criterion.enum.ts`) and from `users/utils/` (now hosts `filter-users/`, `group-users/`).

`.gitkeep` files were preserved in folders that remain intentionally empty (e.g. `app/components/`, `users/directives/`, `users/mocks/`) — those are placeholders for future evolutions.

---

## 7. Retrofit the *Specify* phase (Spec Kit alignment)

**Trigger** — Pointer to [GitHub Spec Kit](https://github.com/github/spec-kit), which splits Spec-Driven Development into `specify` → `plan` → `implement`. We had `plan.md` and `summary.md` (= post-implement) but no `spec.md` capturing the original *what / why*.

**Decision** — Adopt the three-artefact shape (not the Spec Kit CLI/tooling) for every evolution going forward:

- `spec.md` — user stories, acceptance scenarios, must/should/could requirements, success criteria. **Tech-stack-free.**
- `plan.md` — the technical plan. Sealed at end of implementation.
- `summary.md` — append-only post-snapshot iteration log (this file).

For this already-shipped evolution, `spec.md` was retrofitted from the original challenge brief and the conversation that followed; the *Clarifications* section flags it as a retrofit so reviewers know it post-dates the implementation.

**Touched files**

- `docs/evolutions/users-perf-grouping/spec.md` — new; verbatim challenge brief plus structured user stories, acceptance scenarios, requirements, non-functional requirements, success criteria, edge cases, out-of-scope and clarifications.
- `docs/evolutions/README.md` — added a *Three artefacts per evolution* table mapping our files to Spec Kit phases; rewrote *Workflow* to start with the spec; updated the index to surface all three artefacts; added the spec ↔ plan separation rule under *Conventions*.
- `AGENTS.md` — Spec-Driven Development section rewritten to introduce `spec.md` alongside `plan.md` and `summary.md`; ownership table updated for `docs/evolutions/`.
- `README.md` — *Project documentation* bullet now points at `users-perf-grouping/spec.md` first and explains the three-artefact model.

---

## How to use this file going forward

For a new iteration on the same evolution, append a numbered section here. Cite the **trigger** (the prompt or the line that flagged the issue), the **decision** (the rule we landed on), and the **touched files**. If a change is large enough that it merits its own plan, spin up a fresh `docs/evolutions/<new-name>/` folder instead.
