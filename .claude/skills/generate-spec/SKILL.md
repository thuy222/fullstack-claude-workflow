---
name: generate-spec
description: Create a feature specification document in the specs/ folder using a fixed template (overview, business requirements, acceptance criteria, edge cases). Use when the user wants to write or draft a spec for a feature.
---

# generate-spec

Write (or update) a feature specification in the repo-root `specs/` folder. The structure is defined
by **`specs/template.md`** — that file is the single source of truth; do not embed your own copy.

## Steps

1. Determine the feature **name** and intent. If the user hasn't described the feature in enough detail, ask a couple of brief clarifying questions (who it's for, the core user action, any known constraints). Derive the target path `specs/<kebab-feature-name>.md`.
2. **Check whether that file already exists.**
   - **It exists →** read it and **modify it in place**. Merge the new or changed information into the relevant sections; preserve content that still holds (don't discard prior work). Set the header **`Updated:` to today's date**.
   - **It's new →** read **`specs/template.md`** and write a fresh spec following its exact structure, with `Status: Draft` and `Updated:` set to today's date.
3. Fill every section with concrete content drawn from the request — do not leave the `<…>` hint placeholders. Use checkbox bullets (`- [ ]`) for requirements and acceptance criteria so progress can be tracked.
4. If something is genuinely unknown, capture it under **Open Questions** rather than guessing.

## Notes

- **Today's date** comes from the session context (`currentDate`, format `YYYY-MM-DD`). Always refresh `Updated:` whenever you edit a spec.
- Changing `specs/template.md` changes the structure new specs are created with — keep this skill template-agnostic.

## After creating or updating

Show the user the path to the spec, whether it was created or updated, and a one-line summary. Offer to refine any section.
