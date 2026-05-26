using HackathonVotingApp.Api.Data;
using HackathonVotingApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HackathonVotingApp.Api.Services;

public class VotingService(AppDbContext db) : IVotingService
{
    private static string NormalizeToken(string token) =>
        token.Trim().ToUpperInvariant();

    private static bool IsValidToken(string normalized)
    {
        if (normalized.Length < 8 || normalized.Length > 12) return false;
        if (!normalized.All(char.IsLetterOrDigit)) return false;
        if (!normalized.Any(char.IsDigit)) return false;
        return !IsWeakToken(normalized);
    }

    private static bool IsWeakToken(string normalized)
    {
        // All same character: AAAAAAAA, 11111111
        if (normalized.Distinct().Count() == 1) return true;

        // Purely sequential digit run: 12345678, 87654321
        if (!normalized.All(char.IsDigit)) return false;
        bool ascending = true, descending = true;
        for (var i = 1; i < normalized.Length; i++)
        {
            if (normalized[i] - normalized[i - 1] != 1) ascending = false;
            if (normalized[i - 1] - normalized[i] != 1) descending = false;
        }
        return ascending || descending;
    }

    private static int GetPointsForRanking(int ranking) =>
        ranking switch
        {
            1 => 8,
            2 => 5,
            3 => 3,
            4 => 2,
            5 => 1,
            _ => 0,
        };

    private async Task<VotingState> GetOrCreateVotingStateAsync()
    {
        var state = await db.VotingStates.SingleOrDefaultAsync(v => v.Id == 1);
        if (state is not null)
            return state;

        state = new VotingState
        {
            Id = 1,
            CurrentSessionId = 1,
            IsOpen = false,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        db.VotingStates.Add(state);
        await db.SaveChangesAsync();
        return state;
    }

    public async Task<SubmitBallotResult> SubmitBallotAsync(SubmitBallotRequest request)
    {
        var votingState = await GetOrCreateVotingStateAsync();
        if (!votingState.IsOpen)
            return SubmitBallotResult.Failed(SubmitBallotError.VotingClosed);

        var rawToken = request.VoterAliasToken?.Trim();
        var normalizedToken = rawToken is null ? string.Empty : NormalizeToken(rawToken);
        if (!IsValidToken(normalizedToken))
            return SubmitBallotResult.Failed(SubmitBallotError.InvalidVoter);

        var entries = request.Entries;
        if (entries is null || entries.Count == 0)
            return SubmitBallotResult.Failed(SubmitBallotError.InvalidBallot);

        var presentationIds = await db.Presentations.Select(p => p.Id).ToListAsync();
        var requiredRankCount = Math.Min(5, presentationIds.Count);
        if (requiredRankCount == 0)
            return SubmitBallotResult.Failed(SubmitBallotError.InvalidBallot);

        if (entries.Count != requiredRankCount)
            return SubmitBallotResult.Failed(SubmitBallotError.InvalidBallot);

        var existingIds = presentationIds.ToHashSet();
        if (entries.Any(e => !existingIds.Contains(e.PresentationId)))
            return SubmitBallotResult.Failed(SubmitBallotError.InvalidBallot);

        var distinctPresentationCount = entries.Select(e => e.PresentationId).Distinct().Count();
        if (distinctPresentationCount != requiredRankCount)
            return SubmitBallotResult.Failed(SubmitBallotError.InvalidBallot);

        var ranks = entries.Select(e => e.Ranking).ToList();
        var expectedRanks = Enumerable.Range(1, requiredRankCount).ToHashSet();
        if (ranks.Any(r => r < 1 || r > requiredRankCount) || !expectedRanks.SetEquals(ranks))
            return SubmitBallotResult.Failed(SubmitBallotError.InvalidBallot);

        var alreadySubmitted = await db.Votes.AnyAsync(v =>
            v.SessionId == votingState.CurrentSessionId
            && v.NormalizedVoterAliasToken == normalizedToken
        );
        if (alreadySubmitted)
            return SubmitBallotResult.Failed(SubmitBallotError.DuplicateBallot);

        var now = DateTimeOffset.UtcNow;
        db.Votes.AddRange(
            entries.Select(entry => new Vote
            {
                PresentationId = entry.PresentationId,
                SessionId = votingState.CurrentSessionId,
                VoterAliasToken = normalizedToken,
                NormalizedVoterAliasToken = normalizedToken,
                Ranking = entry.Ranking,
                Notes = entry.Notes,
                CreatedAt = now,
            })
        );

        await db.SaveChangesAsync();
        return SubmitBallotResult.Ok();
    }

    public async Task<IReadOnlyList<AdminVoteResultResponse>> GetAdminResultsAsync()
    {
        var votingState = await GetOrCreateVotingStateAsync();
        var currentSessionVotes = db.Votes.Where(v => v.SessionId == votingState.CurrentSessionId);

        var summaries = await db
            .Presentations.Select(p => new
            {
                p.Id,
                p.Title,
                p.PresenterName,
                VoteCount = currentSessionVotes.Count(v => v.PresentationId == p.Id),
                TotalPoints = currentSessionVotes
                    .Where(v => v.PresentationId == p.Id)
                    .Select(v => (int?)GetPointsForRanking(v.Ranking))
                    .Sum()
                    ?? 0,
                AveragePoints = currentSessionVotes
                    .Where(v => v.PresentationId == p.Id)
                    .Select(v => (double?)GetPointsForRanking(v.Ranking))
                    .Average(),
                FirstPlaceCount = currentSessionVotes.Count(v =>
                    v.PresentationId == p.Id && v.Ranking == 1
                ),
                SecondPlaceCount = currentSessionVotes.Count(v =>
                    v.PresentationId == p.Id && v.Ranking == 2
                ),
                FinalReachedAt = currentSessionVotes
                    .Where(v => v.PresentationId == p.Id)
                    .Select(v => (DateTimeOffset?)v.CreatedAt)
                    .Max(),
                AverageRanking = currentSessionVotes
                    .Where(v => v.PresentationId == p.Id)
                    .Select(v => (double?)v.Ranking)
                    .Average(),
            })
            .OrderByDescending(p => p.TotalPoints)
            .ThenByDescending(p => p.FirstPlaceCount)
            .ThenByDescending(p => p.SecondPlaceCount)
            .ThenByDescending(p => p.VoteCount)
            .ThenBy(p => p.FinalReachedAt == null)
            .ThenBy(p => p.FinalReachedAt)
            .ThenBy(p => p.Id)
            .ToListAsync();

        var notes = await db
            .Votes.Where(v =>
                v.SessionId == votingState.CurrentSessionId && v.Notes != null && v.Notes != ""
            )
            .OrderByDescending(v => v.CreatedAt)
            .Select(v => new
            {
                v.PresentationId,
                Note = new VoteNoteResponse(v.Notes!, v.Ranking, v.CreatedAt),
            })
            .ToListAsync();

        var notesByPresentation = notes
            .GroupBy(v => v.PresentationId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<VoteNoteResponse>)g.Select(v => v.Note).ToList()
            );

        return summaries
            .Select(s => new AdminVoteResultResponse(
                s.Id,
                s.Title,
                s.PresenterName,
                s.VoteCount,
                s.TotalPoints,
                s.AveragePoints,
                s.FirstPlaceCount,
                s.SecondPlaceCount,
                s.AverageRanking,
                notesByPresentation.GetValueOrDefault(s.Id, Array.Empty<VoteNoteResponse>())
            ))
            .ToList();
    }

    public async Task<VotingStateResponse> GetVotingStateAsync()
    {
        var state = await GetOrCreateVotingStateAsync();
        return new VotingStateResponse(state.IsOpen, state.UpdatedAt);
    }

    public async Task<VotingStateResponse> SetVotingStateAsync(bool isOpen)
    {
        var state = await GetOrCreateVotingStateAsync();
        if (isOpen && !state.IsOpen)
            state.CurrentSessionId += 1;

        state.IsOpen = isOpen;
        state.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
        return new VotingStateResponse(state.IsOpen, state.UpdatedAt);
    }
}
