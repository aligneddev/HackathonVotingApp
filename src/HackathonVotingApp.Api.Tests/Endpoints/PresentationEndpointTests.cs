using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using HackathonVotingApp.Api.Data;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace HackathonVotingApp.Api.Tests.Endpoints;

public class PresentationEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public PresentationEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null) services.Remove(descriptor);
                var dbName = $"TestDb-{Guid.NewGuid()}";
                services.AddDbContext<AppDbContext>(options =>
                    options.UseInMemoryDatabase(dbName));
            });
        }).CreateClient();
    }

    [Fact]
    public async Task GetPresentations_ReturnsOkWithEmptyList()
    {
        var response = await _client.GetAsync("/presentations");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("[]");
    }

    [Fact]
    public async Task CreatePresentation_ReturnsCreated()
    {
        var newPresentation = new
        {
            title = "Amazing AI Demo",
            presenterName = "Jane Dev",
            description = "A demo of something amazing"
        };

        var response = await _client.PostAsJsonAsync("/presentations", newPresentation);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task CreatePresentation_ReturnsCreatedPresentationWithId()
    {
        var newPresentation = new
        {
            title = "Cloud Native App",
            presenterName = "John Cloud",
            description = "Serverless everything"
        };

        var response = await _client.PostAsJsonAsync("/presentations", newPresentation);
        var created = await response.Content.ReadFromJsonAsync<PresentationResponse>();

        created.Should().NotBeNull();
        created!.Id.Should().NotBeEmpty();
        created.Title.Should().Be("Cloud Native App");
        created.PresenterName.Should().Be("John Cloud");
    }

    [Fact]
    public async Task GetPresentation_ExistingId_ReturnsOk()
    {
        // First create one
        var newPresentation = new { title = "Test Talk", presenterName = "Speaker", description = "" };
        var createResponse = await _client.PostAsJsonAsync("/presentations", newPresentation);
        var created = await createResponse.Content.ReadFromJsonAsync<PresentationResponse>();

        // Then get it
        var response = await _client.GetAsync($"/presentations/{created!.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetPresentation_MissingId_ReturnsNotFound()
    {
        var response = await _client.GetAsync($"/presentations/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdatePresentation_ReturnsOk()
    {
        // Create first
        var newPresentation = new { title = "Old Title", presenterName = "Speaker", description = "" };
        var createResponse = await _client.PostAsJsonAsync("/presentations", newPresentation);
        var created = await createResponse.Content.ReadFromJsonAsync<PresentationResponse>();

        // Update
        var update = new { title = "New Title", presenterName = "Speaker", description = "Updated" };
        var response = await _client.PutAsJsonAsync($"/presentations/{created!.Id}", update);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task DeletePresentation_ReturnsNoContent()
    {
        // Create first
        var newPresentation = new { title = "To Delete", presenterName = "Speaker", description = "" };
        var createResponse = await _client.PostAsJsonAsync("/presentations", newPresentation);
        var created = await createResponse.Content.ReadFromJsonAsync<PresentationResponse>();

        // Delete
        var response = await _client.DeleteAsync($"/presentations/{created!.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    // Response DTO used for deserialization in tests
    private record PresentationResponse(Guid Id, string Title, string PresenterName, string Description, DateTimeOffset CreatedAt);
}
