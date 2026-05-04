# Skill: Modern Software Engineering Principles

Read this before starting any work on HackathonVotingApp.

---

## Optimize for Learning

Good engineering creates fast feedback loops. Prefer approaches that reveal whether you're right sooner rather than later.

- **Work iteratively** — prefer small, reversible steps over big-bang changes. Each step should be safe to ship or discard.
- **Prioritize feedback** — get code in front of tests, users, and CI as fast as possible. Don't build in isolation.
- **Embrace incrementalism** — each commit should move the system forward, not sideways. Sideways is drift.
- **Be Experimental** — when uncertain, build the smallest thing that could answer the question. Spikes are valid; gold-plating is not.
- **Practice Empiricism** — ground every decision on feedback and evidence, not assumptions. If you haven't tested it, you don't know it.

---

## Optimize for Managing Complexity

Software rots when complexity is allowed to spread unchecked. These principles keep the codebase navigable as it grows.

- **Design for Modularity** — components should be independently replaceable. If swapping one module requires touching five others, the design is wrong.
- **Maintain High Cohesion** — things that change together belong together. A module that does one thing does it well.
- **Separate Concerns** — UI logic, business logic, and data access are distinct layers. They should not bleed into each other.
- **Hide Information and Use Abstraction** — expose only what callers need; encapsulate the rest. Implementation details are not public API.
- **Manage Coupling Effectively** — loose coupling between modules, high cohesion within them. Dependencies should flow in one direction.

---

## In Practice: React + .NET 10

These principles apply directly to the HackathonVotingApp stack.

### Frontend (React)
- Components own only their render concerns — no business logic embedded in JSX.
- State management is explicit and scoped — avoid global state unless truly global.
- API calls go through a dedicated service layer — components call services, not `fetch` directly.

### Backend (.NET 10)
- Controllers are thin — they receive requests, delegate to services, return responses. Nothing more.
- Business logic lives in services — the controller is not the place for rules.
- Repositories abstract data access — services don't write SQL or EF queries directly.
- Domain models don't leak infrastructure concerns — no EF annotations on domain objects unless necessary.
