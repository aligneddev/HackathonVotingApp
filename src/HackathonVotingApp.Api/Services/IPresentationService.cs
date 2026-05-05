using HackathonVotingApp.Api.Models;

namespace HackathonVotingApp.Api.Services;

public interface IPresentationService
{
    Task<IEnumerable<PresentationResponse>> GetAllAsync();
    Task<PresentationResponse?> GetByIdAsync(Guid id);
    Task<PresentationResponse> CreateAsync(CreatePresentationRequest request);
    Task<PresentationResponse?> UpdateAsync(Guid id, UpdatePresentationRequest request);
    Task<bool> DeleteAsync(Guid id);
}
