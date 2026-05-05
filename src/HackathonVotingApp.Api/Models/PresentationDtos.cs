namespace HackathonVotingApp.Api.Models;

public record CreatePresentationRequest(string Title, string PresenterName, string Description);
public record UpdatePresentationRequest(string Title, string PresenterName, string Description);
public record PresentationResponse(Guid Id, string Title, string PresenterName, string Description, DateTimeOffset CreatedAt);

public static class PresentationExtensions
{
    public static PresentationResponse ToResponse(this Presentation p) =>
        new(p.Id, p.Title, p.PresenterName, p.Description, p.CreatedAt);
}
