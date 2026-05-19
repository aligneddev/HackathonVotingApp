using HackathonVotingApp.Api.Data;
using HackathonVotingApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HackathonVotingApp.Api.Services;

public class LeaderboardService(AppDbContext db) : ILeaderboardService
{
    public async Task<IEnumerable<LeaderboardEntryResponse>> GetLeaderboardAsync(int limit = 50)
    {
        return await db
            .Presentations.Select(p => new
            {
                p.Id,
                p.Title,
                p.PresenterName,
                VoteCount = db.Votes.Count(v => v.PresentationId == p.Id),
            })
            .OrderByDescending(p => p.VoteCount)
            .Take(limit)
            .Select(p => new LeaderboardEntryResponse(p.Id, p.Title, p.PresenterName, p.VoteCount))
            .ToListAsync();
    }
}
