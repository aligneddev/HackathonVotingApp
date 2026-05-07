namespace HackathonVotingApp.Api.Models;

/// <summary>
/// Request body for POST /votes/{presentationId}.
/// Ranking must be 1–5 (voter's personal rank for this presentation).
/// </summary>
public record CastVoteRequest(int Ranking, string? Notes);
