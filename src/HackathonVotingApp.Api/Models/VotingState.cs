namespace HackathonVotingApp.Api.Models;

public class VotingState
{
    public int Id { get; set; } = 1;
    public int CurrentSessionId { get; set; } = 1;
    public bool IsOpen { get; set; } = false;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid? CurrentPresentationId { get; set; }
    public DateTimeOffset? PresentationStartedAt { get; set; }
}
