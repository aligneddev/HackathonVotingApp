namespace HackathonVotingApp.Api.Services;

public class VotingService : IVotingService
{
    public Task<bool> CastVoteAsync(Guid presentationId) =>
        throw new NotImplementedException("Voting not yet implemented");

    public Task<int> GetVoteCountAsync(Guid presentationId) =>
        throw new NotImplementedException("Voting not yet implemented");
}
