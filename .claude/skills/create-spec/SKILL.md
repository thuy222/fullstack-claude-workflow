---
name: create-spec
description: Create a feature specification document in the specs/ folder using a fixed template (overview, business requirements, acceptance criteria, edge cases). Use when the user wants to write or draft a spec for a feature.
---

# create-spec

Write a feature specification into the `specs/` folder.

## Steps

1. Determine the feature **name** and intent. If the user hasn't described the feature in enough detail, ask a couple of brief clarifying questions (who it's for, the core user action, any known constraints).
2. Create the `specs/` folder if it doesn't exist.
3. Write the spec to `specs/<kebab-feature-name>.md` using the **template below**. Fill every section with concrete content drawn from the user's request — do not leave placeholders. Use checkbox bullets (`- [ ]`) for requirements and acceptance criteria so progress can be tracked.
4. If something is genuinely unknown, capture it under **Open Questions** rather than guessing.

## Template

```markdown
# <Feature Name>

## Overview
One-paragraph summary of the feature, who it serves, and its purpose.

## Business Requirements
- [ ] <What the business needs this feature to do — outcomes, not implementation.>

## Acceptance Criteria
- [ ] Given <context>, when <action>, then <expected outcome>.

## Edge Cases
- <Boundary conditions, error states, empty/loading states, concurrency, permissions, etc.>

## Out of Scope
- <Explicitly excluded so expectations are clear.>

## Open Questions
- <Unresolved decisions or items needing stakeholder input.>
```

## After creating

Show the user the path to the new spec and a one-line summary. Offer to refine any section.
