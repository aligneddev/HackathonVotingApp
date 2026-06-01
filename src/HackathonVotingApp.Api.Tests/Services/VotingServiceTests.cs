using FluentAssertions;
using HackathonVotingApp.Api.Data;
using HackathonVotingApp.Api.Models;
using HackathonVotingApp.Api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace HackathonVotingApp.Api.Tests.Services;

public class VotingServiceTests
{
    private static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"TestDb-{Guid.NewGuid()}")
            .Options;
        return new AppDbContext(options);
    }

    private static async Task<Presentation> SeedPresentationAsync(AppDbContext db)
    {
        var presentation = new Presentation { Title = "Voting Target", PresenterName = "Speaker" };
        db.Presentations.Add(presentation);
        await db.SaveChangesAsync();
        return presentation;
    }

    // --- SetVotingStateAsync ---

    [Fact]
    public async Task GetVotingStateAsync_DefaultsToClosed()
    {
        // Arrange
        await using var db = CreateDb();
        var svc = new VotingService(db);

        // Act
        var state = await svc.GetVotingStateAsync();

        // Assert
        state.IsOpen.Should().BeFalse();
    }

    [Fact]
    public async Task SetVotingStateAsync_WhenClosed_PreventsBallotSubmission()
    {
        // Arrange
        await using var db = CreateDb();
        var presentation = await SeedPresentationAsync(db);
        var svc = new VotingService(db);
        await svc.SetVotingStateAsync(false);

        var request = new SubmitBallotRequest(
            "ALICE001",
            [new BallotEntryRequest(presentation.Id, 1, null)]
        );

        // Act
        var result = await svc.SubmitBallotAsync(request);

        // Assert
        result.Success.Should().BeFalse();
        result.Error.Should().Be(SubmitBallotError.VotingClosed);
    }

    // --- SubmitBallotAsync token validation ---

    [Theory]
    [InlineData("AB")]              // too short (2)
    [InlineData("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567")] // too long (33)
    [InlineData("ALICE-01")]        // hyphen is invalid
    [InlineData("AAA")]             // all same character
    [InlineData("12345678")]        // ascending sequential digits
    [InlineData("87654321")]        // descending sequential digits
    public async Task SubmitBallotAsync_WithInvalidToken_ReturnsInvalidVoter(string token)
    {
        // Arrange
        await using var db = CreateDb();
        await SeedPresentationAsync(db);
        var svc = new VotingService(db);
        await svc.SetVotingStateAsync(true);
        var request = new SubmitBallotRequest(token, []);

        // Act
        var result = await svc.SubmitBallotAsync(request);

        // Assert
        result.Success.Should().BeFalse();
        result.Error.Should().Be(SubmitBallotError.InvalidVoter);
    }

    [Theory]
    [InlineData("ALICE")]           // letters only now valid
    [InlineData("alice")]           // lowercase normalized to valid
    [InlineData("Your Name")]     // spaces are now valid
    [InlineData("A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1")] // 32 chars (max)
    [InlineData("12345670")]        // digits but not sequential
    public async Task SubmitBallotAsync_WithValidToken_ReturnsSuccess(string token)
    {
        // Arrange
        await using var db = CreateDb();
        var presentation = await SeedPresentationAsync(db);
        var svc = new VotingService(db);
        await svc.SetVotingStateAsync(true);
        var request = new SubmitBallotRequest(
            token,
            [new BallotEntryRequest(presentation.Id, 1, null)]
        );

        // Act
        var result = await svc.SubmitBallotAsync(request);

        // Assert
        result.Success.Should().BeTrue();
    }

    [Fact]
    public async Task GetAdminResultsAsync_RanksByWeightedPoints_NotAverageRanking()
    {
        // Arrange
        await using var db = CreateDb();
        var p1 = new Presentation { Title = "Single First Place", PresenterName = "Speaker A" };
        var p2 = new Presentation { Title = "Two Second Places", PresenterName = "Speaker B" };
        db.Presentations.AddRange(p1, p2);
        db.Votes.AddRange(
            new Vote
            {
                PresentationId = p1.Id,
                VoterAliasToken = "A",
                Ranking = 1,
            }, // 8 points
            new Vote
            {
                PresentationId = p2.Id,
                VoterAliasToken = "B",
                Ranking = 2,
            }, // 5 points
            new Vote
            {
                PresentationId = p2.Id,
                VoterAliasToken = "C",
                Ranking = 2,
            } // 5 points => 10 total
        );
        await db.SaveChangesAsync();
        var svc = new VotingService(db);

        // Act
        var results = await svc.GetAdminResultsAsync();

        // Assert
        results.Should().HaveCount(2);
        results[0].Id.Should().Be(p2.Id);
        results[1].Id.Should().Be(p1.Id);
    }
}
