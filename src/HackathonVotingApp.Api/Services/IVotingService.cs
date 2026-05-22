using HackathonVotingApp.Api.Models;

namespace HackathonVotingApp.Api.Services;

public interface IVotingService
{
    Task<bool> CastVoteAsync(Guid presentationId, string voterName, int ranking, string? notes);
    Task<int> GetVoteCountAsync(Guid presentationId);
    Task<IReadOnlyList<AdminVoteResultResponse>> GetAdminResultsAsync();
    Task<VotingStateResponse> GetVotingStateAsync();
    Task<VotingStateResponse> SetVotingStateAsync(bool isOpen);
}
