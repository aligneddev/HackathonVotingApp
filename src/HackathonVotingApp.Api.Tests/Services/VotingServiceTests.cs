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

    // --- CastVoteAsync ---

    [Fact]
    public async Task CastVoteAsync_WithValidPresentationId_ReturnsTrue()
    {
        // Arrange
        await using var db = CreateDb();
        var presentation = await SeedPresentationAsync(db);
        var svc = new VotingService(db);

        // Act — will throw NotImplementedException (red)
        var result = await svc.CastVoteAsync(presentation.Id, "Alice", 1, null);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CastVoteAsync_WithNonExistentPresentationId_ReturnsFalse()
    {
        // Arrange
        await using var db = CreateDb();
        var svc = new VotingService(db);

        // Act — will throw NotImplementedException (red)
        var result = await svc.CastVoteAsync(Guid.NewGuid(), "Alice", 1, null);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task CastVoteAsync_WhenCalledTwiceForSamePresentationId_ReturnsFalseSecondTime()
    {
        // Arrange
        await using var db = CreateDb();
        var presentation = await SeedPresentationAsync(db);
        var svc = new VotingService(db);

        // Act — will throw NotImplementedException on first call (red)
        var firstResult = await svc.CastVoteAsync(presentation.Id, "Alice", 1, null);
        var secondResult = await svc.CastVoteAsync(presentation.Id, "Alice", 1, null);

        // Assert — first succeeds, second is duplicate and returns false
        firstResult.Should().BeTrue();
        secondResult.Should().BeFalse();
    }

    // --- GetVoteCountAsync ---

    [Fact]
    public async Task GetVoteCountAsync_WithNoVotes_ReturnsZero()
    {
        // Arrange
        await using var db = CreateDb();
        var presentation = await SeedPresentationAsync(db);
        var svc = new VotingService(db);

        // Act — will throw NotImplementedException (red)
        var count = await svc.GetVoteCountAsync(presentation.Id);

        // Assert
        count.Should().Be(0);
    }

    [Fact]
    public async Task GetVoteCountAsync_AfterOneVote_ReturnsOne()
    {
        // Arrange
        await using var db = CreateDb();
        var presentation = await SeedPresentationAsync(db);
        var svc = new VotingService(db);

        // Act — will throw NotImplementedException (red)
        await svc.CastVoteAsync(presentation.Id, "Alice", 1, null);
        var count = await svc.GetVoteCountAsync(presentation.Id);

        // Assert
        count.Should().Be(1);
    }

    [Fact]
    public async Task GetVoteCountAsync_WithNonExistentPresentationId_ReturnsZero()
    {
        // Arrange
        await using var db = CreateDb();
        var svc = new VotingService(db);

        // Act — will throw NotImplementedException (red)
        var count = await svc.GetVoteCountAsync(Guid.NewGuid());

        // Assert
        count.Should().Be(0);
    }

    [Fact]
    public async Task GetVotingStateAsync_DefaultsToOpen()
    {
        // Arrange
        await using var db = CreateDb();
        var svc = new VotingService(db);

        // Act
        var state = await svc.GetVotingStateAsync();

        // Assert
        state.IsOpen.Should().BeTrue();
    }

    [Fact]
    public async Task SetVotingStateAsync_WhenClosed_PreventsVotes()
    {
        // Arrange
        await using var db = CreateDb();
        var presentation = await SeedPresentationAsync(db);
        var svc = new VotingService(db);
        await svc.SetVotingStateAsync(false);

        // Act
        var result = await svc.CastVoteAsync(presentation.Id, "Alice", 1, null);

        // Assert
        result.Should().BeFalse();
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
                VoterName = "A",
                Ranking = 1,
            }, // 8 points
            new Vote
            {
                PresentationId = p2.Id,
                VoterName = "B",
                Ranking = 2,
            }, // 5 points
            new Vote
            {
                PresentationId = p2.Id,
                VoterName = "C",
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
