# Users — Performance + Grouping · Specification

> **Phase:** Specify · **Sibling artefacts:** [`plan.md`](./plan.md) · [`summary.md`](./summary.md)
>
> This file captures the *what* and *why* of the evolution. It is intentionally **tech-stack-free**: implementation choices belong in `plan.md`. It was retrofitted from the original challenge brief, structured along the lines of [Spec Kit](https://github.com/github/spec-kit)'s `/speckit.specify` artefact.

---

## Overview

The starter app renders the awork users list, but cannot scale to a large directory: pagination is the only escape hatch, the row component recomputes derived data on every change-detection pass, and the design has no support for grouping, expansion or search. This evolution removes those constraints and turns the page into a **fast, scannable, group-aware directory of 5,000 users**, fit for review by a senior frontend engineer.

The success of this evolution is judged not just by the features that ship, but by **how the code looks under code review**: structure, testability, framework idiom and collaboration readiness are first-class success criteria.

---

## Source brief (verbatim)

The brief that drove this evolution, copied exactly as received from the awork hiring team, is reproduced here so the spec is auditable against intent:

> - Show a list of users grouped by a specific category. The grouping of the array of Users should be done via a Web Worker. Criteria can be chosen: alphabetically, age, nationality, etc. **[Bonus Point]** Add a button which switches the grouping between multiple categories.
> - Groups should look nice in the UI. Idea of result (Don't limit yourself to this idea, make it look awesome!).
> - Show 5000 Users on the page with good load and runtime performance without using pagination (even in mobile devices). Improve components performance. The page should load fast. The page should be interactive fast. No performance degradation when interacting with the page. Optimize device resources usage: CPU, memory.
> - When clicking on a User from the list, the item should expand inside the same list with a cool animation and show extra information the API provides in a nice and clear way. Feel free to choose the information you display.
> - Improve the overall UI/UX of the app until you are proud of it. The code provided already has some basic styles which are coming from our original awork app, but it still deserves some love. Make it look awesome by, for example, adding a header for the list columns, an improved loading state, etc. Here you can be creative about it, the sky is the limit!
> - Write a documentation on how you approached the problem and what the solution consists of. **[Bonus Point]** Search users without using API. **[Bonus Point]** Add pagination using the page size of 5000 items. The API documentation has the information on how to do this.
>
> **Deliverables**
>
> 1. Source Code: Use git and share a repository via GitHub.
> 2. Feature Documentation: A summary of the solution and argumentation for the decisions made.
> 3. Readme: setup and run instructions plus anything else you judge important.
> 4. **[Bonus Point]** Run the full application on a cloud solution for previewing live via a link.
>
> **Evaluation criteria** — code quality, maintainability and testability; project and components structure; good practices; proper usage of the JS framework and language; correctness and completeness; collaboration aspect.

The data source is the public [randomuser.me](https://randomuser.me) API.

---

## User scenarios

### Primary user story

**AS** a knowledge-worker browsing the awork users directory,
**I WANT** to scan all 5,000 colleagues on one page, grouped by a meaningful criterion, with the ability to expand any user inline,
**SO THAT** I can find a person by surname, by region, by age cohort or by free-text search without paging through screens or losing context.

### Acceptance scenarios

| # | Given                                                              | When                                                          | Then                                                                                                                                |
| - | ------------------------------------------------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1 | The app has just loaded                                            | The first paint completes                                     | The user sees grouped sections, with at least the top groups already populated and rendered.                                        |
| 2 | The user has 5,000 records loaded                                  | They scroll the list rapidly on a mid-tier mobile device      | Frame rate stays smooth (no visible jank); CPU usage does not pin a core; memory does not balloon as scrolling continues.           |
| 3 | The user is looking at a populated group                           | They click on a single user row                               | An inline detail panel expands beneath the row, with a smooth animation, showing additional information from the API.               |
| 4 | A user detail is already expanded                                  | The user clicks on a different row                            | The previous detail collapses, the new one expands; only one row is ever expanded at a time.                                        |
| 5 | The user types in the search field                                 | After a short debounce                                        | The list immediately reflects the filtered users, regrouped consistently — and **no network request is fired** for the search.      |
| 6 | The grouping criterion can be changed (bonus)                      | The user picks a different criterion                          | The list re-groups without blocking the UI, and the previously expanded user (if still visible) remains visible in its new context. |
| 7 | The browser tab loses focus mid-grouping                           | It regains focus                                              | The list state is intact; no work was lost, no work was duplicated.                                                                 |
| 8 | A new build is shipped without a Web Worker (e.g. SSR, old engine) | The container requests a grouping                             | Grouping still completes correctly via a synchronous fallback path; the user is not shown a broken state.                           |

### Edge cases

- **Empty search**: search yields zero matches → the list shows a clear "no results" affordance and a way to clear the search; the previous list comes back instantly when cleared.
- **API failure on initial load**: the page shows a recoverable error state, not an empty list; reloading is one action away.
- **Very narrow viewport**: layout remains readable at mobile widths; the column header still communicates context.
- **Age data missing or out of expected range**: the user lands in a defined "unknown" or boundary bucket rather than disappearing from the list.
- **Multiple rapid clicks on the same row**: collapse/expand is debounced or idempotent — no flicker, no orphaned animations.

---

## Functional requirements

### Must

1. **5,000 users on a single page.** No mandatory user-facing pagination control. The list must be the only navigation surface.
2. **Grouping by configurable criterion.** At minimum: alphabetical, age, and nationality. The criterion dimension must be data-driven so additional criteria can be introduced without touching grouping plumbing.
3. **Off-main-thread grouping.** The grouping computation must not run on the UI thread for the default 5,000-user payload.
4. **Inline expand-and-detail.** Clicking a user must expand an inline panel inside the list itself (not in a modal or sidebar) and reveal additional information from the API. The transition must be animated.
5. **Improved UI/UX.** Column header for the list, an explicit loading state, and a polished visual treatment of groups. The starter visual is the floor, not the ceiling.
6. **Documentation.** A README explaining how to run the project, plus a written narrative of the approach and the rationale behind the major decisions.
7. **Production-quality structure.** Project and component structure must reflect a setup that more than one engineer can reason about and contribute to.

### Should

8. **Deterministic data.** Reproducible across reloads (so reviewers and tests don't see different lists each time).
9. **Synchronous grouping fallback.** Available for tests and for environments without Web Workers.
10. **Accessible interactions.** Group toggles and row expansion are reachable via keyboard and announce state to assistive technology.

### Could (bonus)

11. **Criterion switcher UI.** A control that swaps the active grouping criterion at runtime.
12. **Client-side search.** Filter the loaded users locally, without firing API calls.
13. **Pagination support** with a 5,000-item page size (architecture-only is acceptable; a UI control is the bonus).
14. **Live cloud preview.** A public URL for reviewers.

---

## Non-functional requirements

| Area                  | Requirement                                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Load performance**  | First paint and time-to-interactive must remain fast for 5,000 records. Initial bundle should not regress noticeably from the starter app.   |
| **Runtime perf.**     | Scrolling, expanding and searching must run at the device's display refresh rate; no scroll-induced layout thrash, no GC pauses on expand.   |
| **Resource usage**    | CPU and memory must stay bounded as the user interacts. The list cost must not scale with the *full* dataset on every change-detection pass. |
| **Mobile**            | All of the above must hold on mid-tier mobile hardware, not just desktop dev machines.                                                       |
| **Accessibility**     | WCAG AA minimums: focus management, color contrast, ARIA state for collapsible groups and expanded rows.                                     |
| **Testability**       | The grouping pipeline, the row, the toolbar and the container must each have unit-level coverage. No reliance on deprecated test libraries.  |
| **Maintainability**   | Container vs. presentational split must be enforced; cross-feature coupling kept out of the feature folder.                                  |
| **Collaboration**     | The repo should be set up so a second engineer can clone, run and contribute on day one — clear scripts, clear conventions, clear docs.      |
| **Framework idiom**   | Code should be idiomatic for the chosen framework version, not a port of older patterns.                                                     |

---

## Success criteria

This evolution is considered successful when:

1. All **Must** functional requirements are demonstrable end-to-end with the live app.
2. All non-functional requirements above hold on a representative mid-tier mobile device, verified by manual scroll/interaction.
3. The codebase is in a state where a reviewer can answer "where would I add a new grouping criterion?" or "where is the row template?" by reading folder names alone.
4. The unit-test suite is green and covers the grouping pipeline, the row, the toolbar and the container.
5. Decisions and trade-offs (especially the ones not obvious from the diff) are documented and can be reviewed independently of the code.

---

## Out of scope (this evolution)

- Server-side rendering of the users page.
- Authentication, authorisation or per-user permissions on the list.
- Persisting the user's preferred grouping criterion across reloads.
- Live cloud deployment beyond a documented build artefact.
- The criterion switcher and pagination UIs are explicitly listed as bonus (see §11–13) and are deferred to a follow-up evolution unless schedule permits.

---

## Key entities

The vocabulary used throughout the spec, plan and code:

- **User** — a single record from the API, including identity, contact, demographics and login credentials.
- **Grouping criterion** — the dimension along which users are grouped (e.g. *alphabetical*, *age*, *nationality*).
- **User group** — the result of applying a criterion: a label, a stable key, an ordered list of users belonging to it, and a count.
- **Search term** — the free-text string that filters the user list before grouping.
- **Expanded user** — at most one user whose detail panel is currently visible inside its group.

---

## Clarifications

This spec was retrofitted **after** implementation, from the original challenge brief and the conversation that followed. The following points were clarified during the work and are recorded here for completeness:

- **`ng-mocks` will not be used.** It was deprecated by the maintainers and is excluded from the test stack.
- **Animations are wired with the v21 `animate.enter` / `animate.leave` directives**, not the legacy `@angular/animations` package.
- **Functionality outranks visuals.** Where a trade-off arises, correctness and code quality take precedence over visual polish.
- **The `awork-` prefix is not used in folder names** inside `docs/evolutions/`, since the entire repository is awork-scoped.

Future evolutions on this surface should add their own `## Clarifications` section to their own `spec.md` rather than retroactively editing this one — see the workflow in [`docs/evolutions/README.md`](../README.md).
