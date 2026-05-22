using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using HackathonVotingApp.Api.Data;
using HackathonVotingApp.Api.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace HackathonVotingApp.Api.Tests.Endpoints;

public class VotingEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public VotingEndpointTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClientWithFreshDb(out string dbName)
    {
        dbName = $"TestDb-{Guid.NewGuid()}";
        var name = dbName;
        return _factory
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    var descriptor = services.SingleOrDefault(d =>
                        d.ServiceType == typeof(DbContextOptions<AppDbContext>)
                    );
                    if (descriptor != null)
                        services.Remove(descriptor);
                    services.AddDbContext<AppDbContext>(options =>
                        options.UseInMemoryDatabase(name)
                    );
                });
            })
            .CreateClient();
    }

    private async Task<Guid> SeedPresentationAsync(HttpClient client)
    {
        var request = new
        {
            title = "Voting Test Presentation",
            presenterName = "Test Speaker",
            description = "Used for voting tests",
        };
        var response = await client.PostAsJsonAsync("/api/presentations", request);
        var created = await response.Content.ReadFromJsonAsync<PresentationResponseDto>();
        return created!.Id;
    }

    private static async Task SeedVotesAsync(string dbName, params Vote[] votes)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

        await using var db = new AppDbContext(options);
        db.Votes.AddRange(votes);
        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task CastVote_WithValidPresentationId_Returns201Created()
    {
        // Arrange
        var client = CreateClientWithFreshDb(out _);
        var presentationId = await SeedPresentationAsync(client);

        // Act
        var response = await client.PostAsJsonAsync($"/api/votes/{presentationId}", new { voterName = "Alice", ranking = 1, notes = (string?)null });

        // Assert — expects 201 once implemented
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task CastVote_WithNonExistentPresentationId_Returns404NotFound()
    {
        // Arrange
        var client = CreateClientWithFreshDb(out _);
        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await client.PostAsJsonAsync($"/api/votes/{nonExistentId}", new { voterName = "Alice", ranking = 1, notes = (string?)null });

        // Assert — expects 404 (presentation not found) once implemented
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CastVote_WhenAlreadyVoted_Returns409Conflict()
    {
        // Arrange
        var client = CreateClientWithFreshDb(out _);
        var presentationId = await SeedPresentationAsync(client);

        // Send request with the dedup cookie already set (simulates a browser that already voted)
        var requestMsg = new HttpRequestMessage(HttpMethod.Post, $"/api/votes/{presentationId}");
        requestMsg.Headers.Add("Cookie", $"hackathon-voted-{presentationId}=true");
        requestMsg.Content = JsonContent.Create(new { voterName = "Alice", ranking = 1, notes = (string?)null });

        // Act
        var response = await client.SendAsync(requestMsg);

        // Assert — expects 409 once implemented
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task GetVoteCount_WithValidPresentationId_Returns200WithCount()
    {
        // Arrange
        var client = CreateClientWithFreshDb(out _);
        var presentationId = await SeedPresentationAsync(client);

        // Act — route GET /votes/{presentationId}/count does not exist yet
        var response = await client.GetAsync($"/api/votes/{presentationId}/count");

        // Assert — expects 200 with { "count": 0 } once implemented
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<VoteCountResponse>();
        body.Should().NotBeNull();
        body!.Count.Should().Be(0);
    }

    [Fact]
    public async Task GetVoteCount_WithNonExistentPresentationId_Returns404NotFound()
    {
        // Arrange
        var client = CreateClientWithFreshDb(out _);
        var nonExistentId = Guid.NewGuid();

        // Act — route does not exist yet
        var response = await client.GetAsync($"/api/votes/{nonExistentId}/count");

        // Assert — expects 404 (presentation not found) once implemented
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CastVote_IncreasesVoteCountByOne()
    {
        // Arrange
        var client = CreateClientWithFreshDb(out _);
        var presentationId = await SeedPresentationAsync(client);

        // Act — cast one vote, then check count
        await client.PostAsJsonAsync($"/api/votes/{presentationId}", new { voterName = "Alice", ranking = 1, notes = (string?)null });
        var countResponse = await client.GetAsync($"/api/votes/{presentationId}/count");

        // Assert — expects count to be 1 after one successful vote
        countResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await countResponse.Content.ReadFromJsonAsync<VoteCountResponse>();
        body!.Count.Should().Be(1);
    }

    [Fact]
    public async Task GetAdminResults_ReturnsEntriesRankedByAverageAscending()
    {
        // Arrange
        var client = CreateClientWithFreshDb(out var dbName);
        var firstPresentationId = await SeedPresentationAsync(client);
        var secondPresentationId = await SeedPresentationAsync(client);

        await SeedVotesAsync(
            dbName,
            new Vote { PresentationId = firstPresentationId, Ranking = 1, Notes = "Great architecture" },
            new Vote { PresentationId = firstPresentationId, Ranking = 2, Notes = "Solid delivery" },
            new Vote { PresentationId = secondPresentationId, Ranking = 4, Notes = "Needs polish" }
        );

        // Act
        var response = await client.GetAsync("/api/admin/results");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<List<AdminResultResponse>>();
        body.Should().NotBeNull();
        body!.Should().HaveCount(2);

        body[0].Id.Should().Be(firstPresentationId);
        body[0].VoteCount.Should().Be(2);
        body[0].AverageRanking.Should().Be(1.5);

        body[1].Id.Should().Be(secondPresentationId);
        body[1].VoteCount.Should().Be(1);
        body[1].AverageRanking.Should().Be(4.0);
    }

    [Fact]
    public async Task GetAdminResults_IncludesVoteNotes()
    {
        // Arrange
        var client = CreateClientWithFreshDb(out var dbName);
        var presentationId = await SeedPresentationAsync(client);

        await SeedVotesAsync(
            dbName,
            new Vote
            {
                PresentationId = presentationId,
                Ranking = 1,
                Notes = "Loved the clarity",
                CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-2),
            },
            new Vote
            {
                PresentationId = presentationId,
                Ranking = 2,
                Notes = "Great demo flow",
                CreatedAt = DateTimeOffset.UtcNow,
            }
        );

        // Act
        var response = await client.GetAsync("/api/admin/results");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<List<AdminResultResponse>>();
        body.Should().NotBeNull();
        body!.Should().ContainSingle();

        var result = body[0];
        result.Notes.Should().HaveCount(2);
        result.Notes[0].Notes.Should().Be("Great demo flow");
        result.Notes[1].Notes.Should().Be("Loved the clarity");
    }

    [Fact]
    public async Task GetVotingState_ReturnsCurrentState()
    {
        // Arrange
        var client = CreateClientWithFreshDb(out _);

        // Act
        var response = await client.GetAsync("/api/admin/voting-state");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<VotingStateResponse>();
        body.Should().NotBeNull();
        body!.IsOpen.Should().BeTrue();
    }

    [Fact]
    public async Task EndVoting_ThenCastVote_Returns403Forbidden()
    {
        // Arrange
        var client = CreateClientWithFreshDb(out _);
        var presentationId = await SeedPresentationAsync(client);
        await client.PostAsync("/api/admin/voting/end", null);

        // Act
        var voteResponse = await client.PostAsJsonAsync($"/api/votes/{presentationId}", new { voterName = "Alice", ranking = 1, notes = (string?)null });

        // Assert
        voteResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task StartVoting_AfterEndVoting_AllowsCastVote()
    {
        // Arrange
        var client = CreateClientWithFreshDb(out _);
        var presentationId = await SeedPresentationAsync(client);
        await client.PostAsync("/api/admin/voting/end", null);
        await client.PostAsync("/api/admin/voting/start", null);

        // Act
        var voteResponse = await client.PostAsJsonAsync($"/api/votes/{presentationId}", new { voterName = "Alice", ranking = 1, notes = (string?)null });

        // Assert
        voteResponse.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    // Local DTOs for deserialization
    private record PresentationResponseDto(
        Guid Id,
        string Title,
        string PresenterName,
        string Description,
        DateTimeOffset CreatedAt
    );

    private record VoteCountResponse(int Count);

    private record AdminResultResponse(
        Guid Id,
        string Title,
        string PresenterName,
        int VoteCount,
        double? AverageRanking,
        List<AdminVoteNoteResponse> Notes
    );

    private record AdminVoteNoteResponse(string Notes, int Ranking, DateTimeOffset CreatedAt);

    private record VotingStateResponse(bool IsOpen, DateTimeOffset UpdatedAt);
}
