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
        var response = await client.PostAsJsonAsync("/presentations", request);
        var created = await response.Content.ReadFromJsonAsync<PresentationResponseDto>();
        return created!.Id;
    }

    [Fact]
    public async Task CastVote_WithValidPresentationId_Returns201Created()
    {
        // Arrange
        var client = CreateClientWithFreshDb(out _);
        var presentationId = await SeedPresentationAsync(client);

        // Act — route POST /votes/{presentationId} does not exist yet; will return 404 from missing route
        var response = await client.PostAsync($"/votes/{presentationId}", null);

        // Assert — expects 201 once implemented
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task CastVote_WithNonExistentPresentationId_Returns404NotFound()
    {
        // Arrange
        var client = CreateClientWithFreshDb(out _);
        var nonExistentId = Guid.NewGuid();

        // Act — route does not exist yet
        var response = await client.PostAsync($"/votes/{nonExistentId}", null);

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
        var requestMsg = new HttpRequestMessage(HttpMethod.Post, $"/votes/{presentationId}");
        requestMsg.Headers.Add("Cookie", $"hackathon-voted-{presentationId}=true");

        // Act — route does not exist yet
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
        var response = await client.GetAsync($"/votes/{presentationId}/count");

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
        var response = await client.GetAsync($"/votes/{nonExistentId}/count");

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
        await client.PostAsync($"/votes/{presentationId}", null);
        var countResponse = await client.GetAsync($"/votes/{presentationId}/count");

        // Assert — expects count to be 1 after one successful vote
        countResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await countResponse.Content.ReadFromJsonAsync<VoteCountResponse>();
        body!.Count.Should().Be(1);
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
}
