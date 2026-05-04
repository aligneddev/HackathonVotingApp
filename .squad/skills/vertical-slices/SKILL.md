# Skill: Vertical Slice Development

Read this before starting any work on HackathonVotingApp.

---

## What Is a Vertical Slice?

A vertical slice is one thin, complete, end-to-end piece of functionality: UI → API → data store → back. It cuts through all layers of the stack rather than building one layer at a time.

- Each slice is **independently valuable and demonstrable** — you can show it to Kevin and it does something real.
- Slices are **the unit of work** — nothing is "half done". A slice is done when it works end-to-end.
- **Prefer thin slices over wide layers** — don't build all the backend before touching the frontend. Don't build the full data model before the first feature works.

---

## Why Slices?

Building by layer (all backend first, then all frontend) creates integration risk, delays feedback, and produces code that can't be validated until the very end. Slices invert this: every slice is demonstrable, testable, and releasable on its own.

---

## How to Cut a Slice on This Stack

1. **Define the slice by its user-visible behavior first** — what does the user do? What do they see? Write this down before writing code.
2. Follow the column top-to-bottom:
   - React component + route
   - API endpoint (.NET 10 controller)
   - Service (business logic)
   - Data access (EF Core / repository)
   - Back up through the same path
3. **Each slice gets its own tests** (unit + integration) — written *before* implementation. See the TDD skill (`.squad/skills/tdd-workflow/SKILL.md`).
4. **Acceptance criteria**: the slice is releasable on its own. If it isn't, it's not done.

---

## Definition of Done for a Slice

- [ ] Failing tests written and reviewed by Kevin
- [ ] Implementation passes all tests
- [ ] No regressions in existing slices
- [ ] CI green on trunk
