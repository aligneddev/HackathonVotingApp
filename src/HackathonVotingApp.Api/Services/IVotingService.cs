namespace HackathonVotingApp.Api.Services;

public interface IVotingService
{
    Task<bool> CastVoteAsync(Guid presentationId, int ranking, string? notes);
    Task<int> GetVoteCountAsync(Guid presentationId);
}
