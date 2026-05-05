using HackathonVotingApp.Api.Data;
using HackathonVotingApp.Api.Models;

namespace HackathonVotingApp.Api.Services;

public class LeaderboardService(AppDbContext db) : ILeaderboardService
{
    public Task<IEnumerable<LeaderboardEntryResponse>> GetLeaderboardAsync(int limit = 10)
    {
        throw new NotImplementedException();
    }
}
