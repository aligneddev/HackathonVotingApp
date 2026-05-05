using HackathonVotingApp.Api.Models;

namespace HackathonVotingApp.Api.Services;

public interface ILeaderboardService
{
    Task<IEnumerable<LeaderboardEntryResponse>> GetLeaderboardAsync(int limit = 50);
}
