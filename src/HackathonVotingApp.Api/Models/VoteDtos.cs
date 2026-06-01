namespace HackathonVotingApp.Api.Models;

public record BallotEntryRequest(Guid PresentationId, int Ranking, string? Notes);

public record SubmitBallotRequest(string VoterAliasToken, IReadOnlyList<BallotEntryRequest> Entries);

public enum SubmitBallotError
{
    None = 0,
    VotingClosed,
    InvalidVoter,
    InvalidBallot,
    DuplicateBallot,
}

public record SubmitBallotResult(bool Success, SubmitBallotError Error)
{
    public static SubmitBallotResult Ok() => new(true, SubmitBallotError.None);

    public static SubmitBallotResult Failed(SubmitBallotError error) => new(false, error);
}

public record VoteNoteResponse(string Notes, int Ranking, DateTimeOffset CreatedAt);

public record AdminVoteResultResponse(
    Guid Id,
    string Title,
    string PresenterName,
    int VoteCount,
    int TotalPoints,
    double? AveragePoints,
    int FirstPlaceCount,
    int SecondPlaceCount,
    double? AverageRanking,
    IReadOnlyList<VoteNoteResponse> Notes
);

public record AdminVoterBallotEntryResponse(
    Guid PresentationId,
    string PresentationTitle,
    string PresenterName,
    int Ranking,
    string? Notes,
    DateTimeOffset CreatedAt
);

public record AdminVoterBallotResponse(
    string VoterAliasToken,
    IReadOnlyList<AdminVoterBallotEntryResponse> Entries
);

public record VotingStateResponse(bool IsOpen, DateTimeOffset UpdatedAt);

public record PublicVotingStateResponse(
    bool IsOpen,
    Guid? CurrentPresentationId,
    string? CurrentPresentationTitle,
    DateTimeOffset? PresentationStartedAt,
    int DurationMinutes
);

public record StartPresentationRequest(Guid PresentationId);
