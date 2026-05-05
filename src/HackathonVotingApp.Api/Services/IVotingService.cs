namespace HackathonVotingApp.Api.Services;

public interface IVotingService
{
    // Voting logic to be implemented in a future slice
    Task<bool> CastVoteAsync(Guid presentationId);
    Task<int> GetVoteCountAsync(Guid presentationId);
}
