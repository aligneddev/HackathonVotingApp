namespace HackathonVotingApp.Api.Models;

public class Vote
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PresentationId { get; set; }
    public int SessionId { get; set; } = 1;
    public string VoterName { get; set; } = string.Empty;
    public string NormalizedVoterName { get; set; } = string.Empty;
    public int Ranking { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
