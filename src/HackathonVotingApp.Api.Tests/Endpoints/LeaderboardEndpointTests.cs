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

public class LeaderboardEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public LeaderboardEndpointTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClientWithFreshDb()
    {
        var dbName = $"TestDb-{Guid.NewGuid()}";
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
                        options.UseInMemoryDatabase(dbName)
                    );
                });
            })
            .CreateClient();
    }

    [Fact]
    public async Task GetLeaderboard_ReturnsOk()
    {
        // Arrange
        var client = CreateClientWithFreshDb();

        // Act — GET /leaderboard does not exist yet; will return 404 (red)
        var response = await client.GetAsync("/leaderboard");

        // Assert — expects 200 once implemented
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetLeaderboard_ReturnsRankedList()
    {
        // Arrange
        var client = CreateClientWithFreshDb();

        var pres1Response = await client.PostAsJsonAsync("/presentations", new
        {
            title = "Popular Talk",
            presenterName = "Speaker A",
            description = "Has votes",
        });
        var pres2Response = await client.PostAsJsonAsync("/presentations", new
        {
            title = "Quiet Talk",
            presenterName = "Speaker B",
            description = "No votes",
        });
        var pres1 = await pres1Response.Content.ReadFromJsonAsync<PresentationResponseDto>();

        // Cast one vote for pres1 (pres2 gets zero)
        await client.PostAsync($"/votes/{pres1!.Id}", null);

        // Act — GET /leaderboard does not exist yet (red)
        var response = await client.GetAsync("/leaderboard");
        var body = await response.Content.ReadFromJsonAsync<List<LeaderboardEntryDto>>();

        // Assert — pres1 (1 vote) should come before pres2 (0 votes)
        body.Should().NotBeNull();
        body!.Should().BeInDescendingOrder(e => e.VoteCount);
    }

    [Fact]
    public async Task GetLeaderboard_ReturnsEmptyArray_WhenNoPresentations()
    {
        // Arrange
        var client = CreateClientWithFreshDb();

        // Act — GET /leaderboard does not exist yet (red)
        var response = await client.GetAsync("/leaderboard");
        var body = await response.Content.ReadFromJsonAsync<List<LeaderboardEntryDto>>();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        body.Should().BeEmpty();
    }

    // Local DTOs for deserialization
    private record PresentationResponseDto(
        Guid Id,
        string Title,
        string PresenterName,
        string Description,
        DateTimeOffset CreatedAt
    );

    private record LeaderboardEntryDto(Guid Id, string Title, string PresenterName, int VoteCount);
}
