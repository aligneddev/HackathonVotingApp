# Conventions

## Engineering philosophy

- **TDD gate:** Write failing tests first. Tests must be reviewed and approved before implementation begins.
- Vertical slices — each slice is independently shippable.
- Trunk-based development; branch naming: `{initials}/{slice-number}-{feature}`

## C#

- **Format:** `dotnet csharpier format .` before committing.
- **Naming:** Use domain ubiquitous language from `CONTEXT.md` (e.g., `Presentation`, not `Item`).
- **DTOs:** Immutable records for request/response types; never expose EF Core entities on the API surface. Use `.ToResponse()` extension methods at the service boundary.
- **Results:** Use `Results.*` helpers; no exceptions for expected flows.
- **Thin routing:** Business logic lives in services, not `Program.cs`. Route handlers are one-liners.

## TypeScript / React

- **Format:** `cd src/frontend && prettier --write .` before committing.
- **Naming:** Match backend domain language.
- **API calls:** Use typed api modules (`src/api/*.ts`); never call `fetch()` directly in components.
- **Routing:** React Router for all navigation; no `window.location` manipulation.
- **Testing:** Mock api modules (`vi.mock('./api/...')`), not `global.fetch`.
- **Tailwind v4:** CSS-based configuration — no `tailwind.config.js` file.

## Architecture boundaries

- No business logic in route handlers — they delegate to a service and return an `IResult`.
- Services implement domain interfaces and are registered in DI (`AddScoped<IFoo, Foo>()`).
- Each integration test uses a unique in-memory database name to ensure isolation.
