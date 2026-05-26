using HackathonVotingApp.Api.Models;

namespace HackathonVotingApp.Api.Services;

public interface IVotingService
{
    Task<SubmitBallotResult> SubmitBallotAsync(SubmitBallotRequest request);
    Task<IReadOnlyList<AdminVoteResultResponse>> GetAdminResultsAsync();
    Task<VotingStateResponse> GetVotingStateAsync();
    Task<VotingStateResponse> SetVotingStateAsync(bool isOpen);
}
