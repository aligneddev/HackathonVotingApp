namespace HackathonVotingApp.Api.Models;

public record LeaderboardEntryResponse(Guid Id, string Title, string PresenterName, int VoteCount);
