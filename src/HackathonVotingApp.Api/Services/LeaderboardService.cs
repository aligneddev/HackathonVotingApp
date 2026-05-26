using HackathonVotingApp.Api.Data;
using HackathonVotingApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HackathonVotingApp.Api.Services;

public class LeaderboardService(AppDbContext db) : ILeaderboardService
{
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

    private async Task<int> GetCurrentSessionIdAsync()
    {
        var state = await db.VotingStates.SingleOrDefaultAsync(v => v.Id == 1);
        if (state is not null)
            return state.CurrentSessionId;

        var newState = new VotingState
        {
            Id = 1,
            CurrentSessionId = 1,
            IsOpen = false,
            UpdatedAt = DateTimeOffset.UtcNow,
        };

        db.VotingStates.Add(newState);
        await db.SaveChangesAsync();
        return newState.CurrentSessionId;
    }

    public async Task<IEnumerable<LeaderboardEntryResponse>> GetLeaderboardAsync(int limit = 50)
    {
        var sessionId = await GetCurrentSessionIdAsync();
        var votes = db.Votes.Where(v => v.SessionId == sessionId);

        return await db
            .Presentations.Select(p => new
            {
                p.Id,
                p.Title,
                p.PresenterName,
                VoteCount = votes.Count(v => v.PresentationId == p.Id),
                TotalPoints = votes
                    .Where(v => v.PresentationId == p.Id)
                    .Select(v => (int?)GetPointsForRanking(v.Ranking))
                    .Sum()
                    ?? 0,
                AveragePoints = votes
                    .Where(v => v.PresentationId == p.Id)
                    .Select(v => (double?)GetPointsForRanking(v.Ranking))
                    .Average(),
                FirstPlaceCount = votes.Count(v => v.PresentationId == p.Id && v.Ranking == 1),
                SecondPlaceCount = votes.Count(v => v.PresentationId == p.Id && v.Ranking == 2),
                FinalReachedAt = votes
                    .Where(v => v.PresentationId == p.Id)
                    .Select(v => (DateTimeOffset?)v.CreatedAt)
                    .Max(),
            })
            .OrderByDescending(p => p.TotalPoints)
            .ThenByDescending(p => p.FirstPlaceCount)
            .ThenByDescending(p => p.SecondPlaceCount)
            .ThenByDescending(p => p.VoteCount)
            .ThenBy(p => p.FinalReachedAt == null)
            .ThenBy(p => p.FinalReachedAt)
            .ThenBy(p => p.Id)
            .Take(limit)
            .Select(p => new LeaderboardEntryResponse(
                p.Id,
                p.Title,
                p.PresenterName,
                p.VoteCount,
                p.TotalPoints,
                p.AveragePoints
            ))
            .ToListAsync();
    }
}
