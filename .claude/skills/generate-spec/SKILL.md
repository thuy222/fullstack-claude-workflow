---
name: generate-spec
description: Create a feature specification document in the specs/ folder using a fixed template (context & goals, user stories, functional requirements, API contract, data model, security, edge cases, acceptance criteria). Use when the user wants to write or draft a spec for a feature.
argument-hint: <feature-name> [brief description]
---

# generate-spec

Write (or update) a feature specification in the repo-root `specs/` folder. The structure is defined
by **`specs/template.md`** — that file is the single source of truth; do not embed your own copy. It
is a structured 10-section spec (metadata table → Context & Goals → User Stories → Functional
Requirements → API Contract → Data Model → Non-Functional → Security → Edge Cases → Acceptance Criteria
→ Open Questions).

## Steps

1. Determine the feature **name** and intent. If the user hasn't described the feature in enough detail, ask a couple of brief clarifying questions (who it's for, the core user action, which app(s) it touches — client / server / both, any known constraints). Derive the target path `specs/<kebab-feature-name>.md`.
2. **Check whether that file already exists.**
   - **It exists →** read it and **modify it in place**. Merge the new or changed information into the relevant sections; preserve content that still holds (don't discard prior work). Set the metadata **`Updated` row to today's date**.
   - **It's new →** read **`specs/template.md`** and write a fresh spec following its exact structure, with `Status: Draft` and the `Updated` row set to today's date.
3. Fill every section with concrete content drawn from the request — do not leave the `<…>` hint placeholders.
   - **Use the stable IDs**: number user stories `US-1, US-2, …` and functional requirements `FR-<group>.<n>` so acceptance criteria, tests, and PRs can cite them.
   - **Acceptance criteria** are checkbox bullets (`- [ ]`) and must each be testable and traceable to a US/FR — they directly drive the `write-test` skill.
   - **Omit a section only if it is genuinely N/A** for this feature (e.g. no *Data Model* for a pure UI change, no *API Contract* for a static page). Don't renumber the remaining sections — keep their numbers stable.
4. If something is genuinely unknown, capture it under **Open Questions** rather than guessing.

## Notes

- **Today's date** comes from the session context (`currentDate`, format `YYYY-MM-DD`). Always refresh the `Updated` row whenever you edit a spec.
- The *Data Model* section maps to `server/prisma/schema.prisma` (implement with the `database-design` skill); *Acceptance Criteria* feed the `write-test` skill. Cross-reference these where useful, but keep the spec implementation-agnostic.
- Changing `specs/template.md` changes the structure new specs are created with — keep this skill template-agnostic.

## After creating or updating

Show the user the path to the spec, whether it was created or updated, and a one-line summary. Offer to refine any section.
