# Evolutions — Spec-Driven Development log

This folder is the **change history of how we built things, not just what shipped**. Each subfolder is one *evolution*: a non-trivial change driven by a written spec we agreed on before coding.

If you want to know *why* a part of the codebase looks the way it does, this is the first place to look.

## Three artefacts per evolution

We borrow the shape (not the tooling) of [GitHub's Spec Kit](https://github.com/github/spec-kit), which splits Spec-Driven Development into three phases:

| Phase            | Spec Kit command       | File in this repo | Purpose                                                                                                                          |
| ---------------- | ---------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Specify**      | `/speckit.specify`     | `spec.md`         | What we are building and why. User stories, acceptance scenarios, requirements. **No tech stack.**                               |
| **Plan**         | `/speckit.plan`        | `plan.md`         | How we build it. Tech stack, architecture, file map, trade-offs. Sealed at end of implementation; ends with *Outcome & Deviations*. |
| **Implement**    | `/speckit.implement`   | (the diff itself) | The code. The plan's *Outcome & Deviations* section is the closing paragraph of this phase.                                      |
| **Iterate**      | (post-implementation)  | `summary.md`      | Append-only log of refactors that landed *after* the plan was sealed (renames, reorganisations, style passes).                   |

We do not run the Spec Kit CLI. The conventions here are deliberately lightweight: three Markdown files, plain folders, no extra tooling.

## Workflow

1. **Specify.** Open a new evolution by writing `docs/evolutions/<evolution-name>/spec.md`. Capture the user stories, the acceptance scenarios, the must/should/could requirements, and the success criteria. Stay tech-stack-free.
2. **Plan in `.cursor/plans/`.** While we're still iterating on architecture, file maps and trade-offs, the live working copy of a plan lives in `.cursor/plans/<evolution-name>.plan.md`. It can change freely. It is not committed to the repo as a spec.
3. **Snapshot the plan.** When implementation is done, drop a clean copy into `docs/evolutions/<evolution-name>/plan.md`. That file becomes the contract reviewers check the implementation against.
4. **Append "Outcome & Deviations".** The committed snapshot ends with an *Outcome & Deviations* section listing everything we changed mid-flight (rejected approaches, fallbacks taken, scope cuts) and *why*.
5. **Track post-implementation iterations in `summary.md`.** Once `plan.md` is sealed, follow-up review feedback that changes the implementation (rename rules, folder reorganisations, style passes) is appended to a sibling `summary.md`. Each entry cites the trigger, the decision and the touched files. The plan and the spec are never edited retroactively.
6. **Index it here.** Add the new evolution to the table below so it's discoverable.

## Conventions

- **Folder names** use `<kebab-case>` and **omit the `awork-` prefix** since everything in this repo is already awork. The same rule applies to project / feature folders elsewhere in the repo.
- **One folder = one evolution**, even if the change touches multiple features. The spec documents the cross-feature scope.
- **`spec.md` and `plan.md` are required artefacts.** Supplementary files (diagrams, ADRs, perf measurements, the `summary.md` iteration log) can live alongside them in the same folder.
- **`summary.md` is optional and append-only.** It only exists once there has been at least one post-snapshot iteration; each new entry is added at the bottom with a numbered heading.
- **Spec ↔ plan separation is hard.** `spec.md` never names a framework, library or test runner; `plan.md` never argues *why* a feature exists. If you find yourself crossing the line, refactor.
- **No "fix-X" or "refactor-Y" evolutions** unless the change is non-trivial. Routine bug fixes go through commits/PRs, not evolutions. The bar for adding an evolution is "this changed how we think about a part of the system."

## Index

| Evolution                                  | Status                            | Artefacts                                                                                                                  | Summary                                                                                                                                                                                                                                          |
| ------------------------------------------ | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`users-perf-grouping/`](./users-perf-grouping/) | Shipped + post-snapshot revisions | [`spec.md`](./users-perf-grouping/spec.md) · [`plan.md`](./users-perf-grouping/plan.md) · [`summary.md`](./users-perf-grouping/summary.md) | 5,000 users on screen, grouped off-main-thread in a Web Worker, virtualised with `@angular/cdk` and a custom `VirtualScrollStrategy`, expand-in-place via `animate.enter` / `animate.leave`, client-side debounced search, hardened `UserService`. |

## Future evolutions (likely candidates)

These are intentionally not in scope today but are good candidates for the next folder here:

- `users-criterion-switcher/` — surface the already-supported `alphabetical` / `age` / `gender` criteria as a UI toggle.
- `users-pagination/` — wire the existing `UserService.getUsers(page)` to a "load more" UI, using the API's `seed` for stability.
- `deploy-static-spa/` — push the production build to a static host (Vercel / Cloudflare Pages / Netlify) with a preview URL.

Each of these would get its own `<kebab-case>/` folder with at minimum a `spec.md` and a `plan.md`, and follow the workflow above.
