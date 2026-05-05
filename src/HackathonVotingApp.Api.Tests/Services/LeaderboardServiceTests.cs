using FluentAssertions;
using HackathonVotingApp.Api.Data;
using HackathonVotingApp.Api.Models;
using HackathonVotingApp.Api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace HackathonVotingApp.Api.Tests.Services;

public class LeaderboardServiceTests
{
    private static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"TestDb-{Guid.NewGuid()}")
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetLeaderboard_ReturnsEmpty_WhenNoPresentations()
    {
        // Arrange
        await using var db = CreateDb();
        var svc = new LeaderboardService(db);

        // Act — throws NotImplementedException (red)
        var result = await svc.GetLeaderboardAsync();

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetLeaderboard_ReturnsPresentationsRankedByVotes()
    {
        // Arrange
        await using var db = CreateDb();
        var p1 = new Presentation { Title = "Low-Vote Talk", PresenterName = "Speaker A" };
        var p2 = new Presentation { Title = "High-Vote Talk", PresenterName = "Speaker B" };
        db.Presentations.AddRange(p1, p2);
        db.Votes.AddRange(
            new Vote { PresentationId = p1.Id },
            new Vote { PresentationId = p2.Id },
            new Vote { PresentationId = p2.Id },
            new Vote { PresentationId = p2.Id }
        );
        await db.SaveChangesAsync();
        var svc = new LeaderboardService(db);

        // Act — throws NotImplementedException (red)
        var result = (await svc.GetLeaderboardAsync()).ToList();

        // Assert — p2 has 3 votes, p1 has 1 vote → p2 first
        result[0].Id.Should().Be(p2.Id);
        result[1].Id.Should().Be(p1.Id);
    }

    [Fact]
    public async Task GetLeaderboard_LimitsToTopN()
    {
        // Arrange
        await using var db = CreateDb();
        for (var i = 0; i < 15; i++)
            db.Presentations.Add(new Presentation { Title = $"Talk {i}", PresenterName = "Speaker" });
        await db.SaveChangesAsync();
        var svc = new LeaderboardService(db);

        // Act — throws NotImplementedException (red)
        var result = await svc.GetLeaderboardAsync(limit: 5);

        // Assert
        result.Should().HaveCount(5);
    }

    [Fact]
    public async Task GetLeaderboard_IncludesVoteCount()
    {
        // Arrange
        await using var db = CreateDb();
        var p = new Presentation { Title = "Voted Demo", PresenterName = "Dev" };
        db.Presentations.Add(p);
        db.Votes.AddRange(
            new Vote { PresentationId = p.Id },
            new Vote { PresentationId = p.Id },
            new Vote { PresentationId = p.Id }
        );
        await db.SaveChangesAsync();
        var svc = new LeaderboardService(db);

        // Act — throws NotImplementedException (red)
        var result = (await svc.GetLeaderboardAsync()).ToList();

        // Assert
        result[0].VoteCount.Should().Be(3);
    }
}
