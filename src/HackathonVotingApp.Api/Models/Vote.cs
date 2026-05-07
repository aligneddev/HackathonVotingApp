namespace HackathonVotingApp.Api.Models;

public class Vote
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PresentationId { get; set; }
    public int Ranking { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
