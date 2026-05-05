using HackathonVotingApp.Api.Data;
using HackathonVotingApp.Api.Models;

namespace HackathonVotingApp.Api.Services;

public class LeaderboardService(AppDbContext db) : ILeaderboardService
{
    public Task<IEnumerable<LeaderboardEntryResponse>> GetLeaderboardAsync(int limit = 50)
    {
        throw new NotImplementedException();
    }
}
