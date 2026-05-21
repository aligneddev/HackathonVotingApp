namespace HackathonVotingApp.Api.Models;

/// <summary>
/// Request body for POST /votes/{presentationId}.
/// Ranking must be 1–5 (voter's personal rank for this presentation).
/// </summary>
public record CastVoteRequest(int Ranking, string? Notes);

public record VoteNoteResponse(string Notes, int Ranking, DateTimeOffset CreatedAt);

public record AdminVoteResultResponse(
	Guid Id,
	string Title,
	string PresenterName,
	int VoteCount,
	double? AverageRanking,
	IReadOnlyList<VoteNoteResponse> Notes
);
