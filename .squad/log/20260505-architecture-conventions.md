# Session Log: Architecture Conventions

**Timestamp:** 2026-05-05
**Session:** architecture-conventions
**Status:** Completed

## Overview

Formalized 6 standing architecture conventions extracted from Slice 2 implementation improvements. Codified patterns for ubiquitous language, thin routing, service interfaces, typed API clients, routing authority, and DTO separation.

## Key Decisions

1. **Ubiquitous Language** — Domain terms consistent from DB to UI; introduce name before code
2. **Thin Routing** — Program.cs as adapter; route handlers are one-liners calling services
3. **Service Interface Seams** — Interfaces + stubs registered before feature slices land
4. **Typed Frontend API Client** — All HTTP centralized in `src/api/{domain}Api.ts`; no fetch in components
5. **React Router** — Single routing authority; every page registers a Route
6. **DTOs ≠ Domain Models** — Entity/DTO separation with ToResponse() extension mapping

## Artifacts Created

- `.squad/decisions.md` — merged architecture conventions; 6 standing decisions
- `.squad/orchestration-log/20260505-obi-wan.md` — obi-wan's work record
- Inbox cleared (2 items: finn-slice1-tests.md, obi-wan-architecture-conventions.md)
