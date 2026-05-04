# TDD Workflow — Test-First with Review Gate

**Authoritative for:** All agents on the HackathonVotingApp team  
**Owner:** Finn (Tester)  
**Established:** 2026-05-04  

---

## The Core Rule

> **No implementation code is written until failing tests exist AND Kevin has reviewed and approved them.**

This is a **hard gate** — not a preference, not a suggestion, not skippable for "small" changes. Every vertical slice, every feature, every bug fix follows this rule.

- "Failing tests" means tests that **compile and parse correctly** but fail because the feature does not yet exist.
- A test that fails due to a syntax error is not a failing test — it is a broken test. Fix it first.
- A test that trivially passes (e.g., `Assert.True(true)`) is not a failing test — it is a lie. Delete it.

---

## The TDD Cycle: Red → Review → Green → Refactor

### 1. 🔴 Red — Write Failing Tests

Write tests for the current vertical slice **before touching implementation**. These tests define the contract.

- Tests must **compile/parse correctly**.
- Tests must **fail** when run, with a failure reason that is "feature doesn't exist yet" (e.g., `NotImplementedException`, 404 response, missing component, missing service method).
- Cover: one happy path + at minimum one error or edge case per slice.
- Do not write implementation stubs just to make tests compile — use interfaces, minimal empty classes, or `throw new NotImplementedException()` as scaffolding only.

### 2. 👀 Review — Stop and Present to Kevin

**Stop here. Do not proceed to Green until Kevin approves.**

Present the failing tests to Kevin (see [Presenting Tests for Kevin's Review](#presenting-tests-for-kevins-review) below).  
Kevin's approval is the gate. No exceptions.

### 3. 🟢 Green — Implement the Minimum

Write the **minimum code** required to make the tests pass. No gold-plating, no extra features, no "while I'm in here."

- If a test passes without implementing the feature, the test is wrong. Fix the test.
- All existing tests must remain green.

### 4. 🔵 Refactor — Clean Up

Clean up the implementation while keeping all tests green.

- Rename, extract, reorganize — but do not change behavior.
- If refactoring causes a test to fail, the refactor changed behavior. Revert or rethink.

---

## How to Write Good Failing Tests

### .NET 10 (xUnit)

**Project structure:**
```
src/
  HackathonVotingApp.Api/
  HackathonVotingApp.Services/
tests/
  HackathonVotingApp.Api.Tests/
  HackathonVotingApp.Services.Tests/
```

**Test class naming:** `{Feature}Tests` or `{ServiceName}Tests`

**Test method naming:** `{MethodName}_Given{Condition}_Should{ExpectedOutcome}`

**Pattern — AAA (Arrange, Act, Assert):**
```csharp
[Fact]
public async Task CastVote_GivenValidRequest_ShouldReturnCreatedResult()
{
    // Arrange
    var request = new CastVoteRequest(ProjectId: "proj-1", VoterId: "voter-42");
    // ...

    // Act
    var result = await _service.CastVoteAsync(request);

    // Assert
    result.Should().NotBeNull();
    result.IsSuccess.Should().BeTrue();
}
```

**Rules:**
- One assertion **concept** per test (multiple `.Should()` calls for the same concept are fine).
- Use **FluentAssertions** for all assertions — `result.Should().Be(...)`, not `Assert.Equal(...)`.
- Mock external dependencies with **NSubstitute** (preferred) or Moq.
- Integration tests use **`WebApplicationFactory<Program>`** to test API endpoints end-to-end with the real service layer wired up.
- Tests live in a parallel `*.Tests` project.

**Tools:**
| Purpose | Library |
|---|---|
| Test runner | xUnit |
| Assertions | FluentAssertions |
| Mocking | NSubstitute |
| API integration tests | WebApplicationFactory (ASP.NET Core) |

---

### React (Vitest + Testing Library)

**File placement:** Co-located with the component.
```
src/
  components/
    VoteButton/
      VoteButton.tsx
      VoteButton.test.tsx
```

**Test naming:** Describes **user behavior**, not implementation details.
- ✅ `renders the vote button`
- ✅ `submits the vote when the button is clicked`
- ✅ `shows an error message when the API call fails`
- ❌ `calls handleClick on click`
- ❌ `sets isLoading to true`

**Pattern:**
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VoteButton } from './VoteButton';

describe('VoteButton', () => {
  it('renders the vote button', () => {
    render(<VoteButton projectId="proj-1" />);
    expect(screen.getByRole('button', { name: /vote/i })).toBeInTheDocument();
  });

  it('submits the vote when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<VoteButton projectId="proj-1" />);
    await user.click(screen.getByRole('button', { name: /vote/i }));
    // assert outcome, not internal call
  });
});
```

**Rules:**
- Query by **role, label, or text** — not by test IDs or CSS classes.
- Use **`userEvent`** for interactions (not `fireEvent`).
- Mock API calls with **MSW (Mock Service Worker)** — never mock `fetch` directly.
- Test **behavior** — what the user sees and does — not implementation details.

**Tools:**
| Purpose | Library |
|---|---|
| Test runner | Vitest |
| Render + queries | @testing-library/react |
| User interactions | @testing-library/user-event |
| API mocking | MSW (Mock Service Worker) |

---

## What Tests to Write for a Vertical Slice

Every vertical slice requires **at minimum**:

| Layer | What to test | Minimum coverage |
|---|---|---|
| **Unit** | Pure business logic, service methods, utility functions | 1 happy path + 1 error/edge case |
| **Integration** | API endpoint: request in → response out, real service layer | 1 happy path + 1 error/edge case |
| **Component** | React component renders correctly + user interactions | 1 render + 1 interaction |

More is better. Never less than this.

---

## Presenting Tests for Kevin's Review

When tests are written and failing, stop and present them using this format:

---

**🔴 Tests ready for review — [Feature Name]**

> These tests define the contract for **[feature]**. They currently fail because [reason — e.g., "the service method does not exist yet"].

**Test file:** `path/to/TestFile.cs` (or `.test.tsx`)

```
[paste or link the test code]
```

**What each test verifies:**
- `MethodName_GivenX_ShouldY` — verifies that [plain English explanation]
- `renders the vote button` — verifies that [plain English explanation]

**Current failure output:**
```
[paste the test runner failure output]
```

**Ready for review — these tests define the contract for [feature]. Approve to proceed with implementation?**

---

Kevin's response determines whether to proceed. A "yes" or "approved" or "LGTM" is the gate. Ambiguous responses require clarification before proceeding.

---

## What NOT to Do

| ❌ Don't | Why |
|---|---|
| Write placeholder/trivially-passing tests | They lie about coverage and give false confidence |
| Write implementation first, backfill tests | Defeats the entire point — you'll write tests that confirm what you built, not what was needed |
| Skip the review gate for "tiny" changes | There are no tiny changes when the gate is a process rule |
| Write tests that test mocks rather than behavior | Mocks are scaffolding; behavior is the contract |
| Use `fireEvent` in React tests | `userEvent` simulates real browser events; `fireEvent` does not |
| Query React components by test ID | Test IDs couple tests to implementation; prefer role/label/text |
| Use `Assert.Equal` in .NET tests | FluentAssertions provides readable, expressive failure messages |

---

## Worked Example — "Cast a Vote" Feature

> ⚠️ These are **skeleton examples** to illustrate structure. They are not real test implementations.

### .NET 10 — API Integration Test (Failing)

```csharp
// File: tests/HackathonVotingApp.Api.Tests/VotingEndpointTests.cs

public class VotingEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public VotingEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task PostVote_GivenValidVoterAndProject_ShouldReturn201Created()
    {
        // Arrange
        var request = new { ProjectId = "proj-1", VoterId = "voter-42" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/votes", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        // CURRENTLY FAILS: endpoint does not exist yet → 404 Not Found
    }

    [Fact]
    public async Task PostVote_GivenVoterAlreadyVoted_ShouldReturn409Conflict()
    {
        // Arrange — voter-42 has already voted for proj-1
        var request = new { ProjectId = "proj-1", VoterId = "voter-42" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/votes", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        // CURRENTLY FAILS: endpoint does not exist yet → 404 Not Found
    }
}
```

**Why these fail:** The `/api/votes` endpoint does not exist. Both tests receive a 404.

---

### React — Component Test (Failing)

```tsx
// File: src/components/VoteButton/VoteButton.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { VoteButton } from './VoteButton';

describe('VoteButton', () => {
  it('renders the vote button', () => {
    render(<VoteButton projectId="proj-1" />);
    expect(screen.getByRole('button', { name: /vote/i })).toBeInTheDocument();
    // CURRENTLY FAILS: VoteButton component does not exist yet
  });

  it('shows a success message after the vote is submitted', async () => {
    server.use(
      http.post('/api/votes', () => HttpResponse.json({ ok: true }, { status: 201 }))
    );
    const user = userEvent.setup();
    render(<VoteButton projectId="proj-1" />);

    await user.click(screen.getByRole('button', { name: /vote/i }));

    expect(screen.getByText(/vote submitted/i)).toBeInTheDocument();
    // CURRENTLY FAILS: VoteButton component does not exist yet
  });

  it('shows an error message when the vote fails', async () => {
    server.use(
      http.post('/api/votes', () => HttpResponse.json({ error: 'Conflict' }, { status: 409 }))
    );
    const user = userEvent.setup();
    render(<VoteButton projectId="proj-1" />);

    await user.click(screen.getByRole('button', { name: /vote/i }));

    expect(screen.getByText(/already voted/i)).toBeInTheDocument();
    // CURRENTLY FAILS: VoteButton component does not exist yet
  });
});
```

**Why these fail:** The `VoteButton` component does not exist. All three tests error on import.

---

## Quick Reference

```
1. Write tests (Red)        → tests compile, tests fail for the right reason
2. Present to Kevin (Review) → STOP. No implementation until approved.
3. Implement minimum (Green) → all tests pass
4. Clean up (Refactor)       → tests stay green
```

**Stack:** xUnit + FluentAssertions + NSubstitute (.NET 10) | Vitest + Testing Library + MSW (React)
