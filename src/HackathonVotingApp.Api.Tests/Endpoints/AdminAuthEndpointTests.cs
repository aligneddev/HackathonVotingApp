using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using HackathonVotingApp.Api.Data;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
#pragma warning disable CA2000 // factory-created clients are disposed by the test framework

namespace HackathonVotingApp.Api.Tests.Endpoints;

public class AdminAuthEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private const string TestPassword = "test-secret";
    private readonly WebApplicationFactory<Program> _factory;

    public AdminAuthEndpointTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    private WebApplicationFactory<Program> BuildFactory() =>
        _factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("AdminPassword", TestPassword);
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(d =>
                    d.ServiceType == typeof(DbContextOptions<AppDbContext>)
                );
                if (descriptor != null)
                    services.Remove(descriptor);
                services.AddDbContext<AppDbContext>(options =>
                    options.UseInMemoryDatabase($"TestDb-{Guid.NewGuid()}")
                );
            });
        });

    /// <summary>
    /// Creates a client that auto-stores and sends cookies (for authenticated flows).
    /// HandleCookies defaults to true in WebApplicationFactoryClientOptions.
    /// </summary>
    private HttpClient CreateAuthenticatedClient() =>
        BuildFactory().CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

    /// <summary>
    /// Creates a plain client with no cookie handling (for unauthenticated flows).
    /// </summary>
    private HttpClient CreateUnauthenticatedClient() =>
        BuildFactory().CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });

    // ---------------------------------------------------------------------------
    // Login endpoint
    // ---------------------------------------------------------------------------

    [Fact]
    public async Task Login_WithCorrectPassword_Returns200AndSetsCookie()
    {
        // Arrange
        var client = CreateAuthenticatedClient();
        var body = new { password = TestPassword };

        // Act
        var response = await client.PostAsJsonAsync("/api/admin/login", body);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Headers.Should().ContainKey("Set-Cookie");
        var setCookie = string.Join("; ", response.Headers.GetValues("Set-Cookie"));
        setCookie.Should().Contain("admin_auth");
    }

    [Fact]
    public async Task Login_WithWrongPassword_Returns401()
    {
        // Arrange
        var client = CreateUnauthenticatedClient();
        var body = new { password = "wrong-password" };

        // Act
        var response = await client.PostAsJsonAsync("/api/admin/login", body);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithEmptyPassword_Returns401()
    {
        // Arrange
        var client = CreateUnauthenticatedClient();
        var body = new { password = "" };

        // Act
        var response = await client.PostAsJsonAsync("/api/admin/login", body);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithMissingBody_Returns400OrError()
    {
        // Arrange
        var client = CreateUnauthenticatedClient();

        // Act — send request with no body / wrong content type
        var response = await client.PostAsync(
            "/api/admin/login",
            new StringContent("not json", System.Text.Encoding.UTF8, "text/plain")
        );

        // Assert — malformed body should produce 400 Bad Request
        ((int)response.StatusCode).Should().BeGreaterThanOrEqualTo(400);
        ((int)response.StatusCode).Should().BeLessThan(500);
    }

    // ---------------------------------------------------------------------------
    // Logout endpoint
    // ---------------------------------------------------------------------------

    [Fact]
    public async Task Logout_Returns200()
    {
        // Arrange — logout does not require being logged in
        var client = CreateUnauthenticatedClient();

        // Act
        var response = await client.PostAsync("/api/admin/logout", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // ---------------------------------------------------------------------------
    // Auth-status endpoint
    // ---------------------------------------------------------------------------

    [Fact]
    public async Task AuthStatus_WithoutCookie_ReturnsFalse()
    {
        // Arrange
        var client = CreateUnauthenticatedClient();

        // Act
        var response = await client.GetAsync("/api/admin/auth-status");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<AuthStatusResponse>();
        body.Should().NotBeNull();
        body!.Authenticated.Should().BeFalse();
    }

    [Fact]
    public async Task AuthStatus_WithValidCookie_ReturnsTrue()
    {
        // Arrange — cookie container client stores the cookie automatically after login
        var client = CreateAuthenticatedClient();
        await client.PostAsJsonAsync("/api/admin/login", new { password = TestPassword });

        // Act
        var response = await client.GetAsync("/api/admin/auth-status");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<AuthStatusResponse>();
        body.Should().NotBeNull();
        body!.Authenticated.Should().BeTrue();
    }

    // ---------------------------------------------------------------------------
    // Protected admin routes — unauthenticated → 401
    // ---------------------------------------------------------------------------

    [Fact]
    public async Task AdminResults_WithoutCookie_Returns401()
    {
        var client = CreateUnauthenticatedClient();
        var response = await client.GetAsync("/api/admin/results");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task AdminVotes_WithoutCookie_Returns401()
    {
        var client = CreateUnauthenticatedClient();
        var response = await client.GetAsync("/api/admin/votes");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task AdminVotingState_WithoutCookie_Returns401()
    {
        var client = CreateUnauthenticatedClient();
        var response = await client.GetAsync("/api/admin/voting-state");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task AdminStartVoting_WithoutCookie_Returns401()
    {
        var client = CreateUnauthenticatedClient();
        var response = await client.PostAsync("/api/admin/voting/start", null);
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task AdminEndVoting_WithoutCookie_Returns401()
    {
        var client = CreateUnauthenticatedClient();
        var response = await client.PostAsync("/api/admin/voting/end", null);
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ---------------------------------------------------------------------------
    // Tampered / invalid cookie → 401
    // ---------------------------------------------------------------------------

    [Fact]
    public async Task TamperedCookie_Returns401()
    {
        // Arrange — manually inject a garbage cookie value that bypasses DataProtection
        var client = CreateUnauthenticatedClient();
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/admin/results");
        request.Headers.Add("Cookie", "admin_auth=this-is-definitely-not-a-valid-protected-payload");

        // Act
        var response = await client.SendAsync(request);

        // Assert — DataProtection should fail to unprotect, resulting in 401
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ---------------------------------------------------------------------------
    // Logout then request → 401
    // ---------------------------------------------------------------------------

    [Fact]
    public async Task LogoutThenRequest_Returns401()
    {
        // Arrange — log in to acquire cookie, then log out
        var client = CreateAuthenticatedClient();
        var loginResponse = await client.PostAsJsonAsync(
            "/api/admin/login",
            new { password = TestPassword }
        );
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var logoutResponse = await client.PostAsync("/api/admin/logout", null);
        logoutResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Act — cookie should be cleared; protected route must now reject the request
        var response = await client.GetAsync("/api/admin/results");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ---------------------------------------------------------------------------
    // Protected admin routes — authenticated → 200
    // ---------------------------------------------------------------------------

    [Fact]
    public async Task AdminVotes_WithValidCookie_Returns200()
    {
        var client = CreateAuthenticatedClient();
        var loginResponse = await client.PostAsJsonAsync(
            "/api/admin/login",
            new { password = TestPassword }
        );
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var response = await client.GetAsync("/api/admin/votes");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task AdminVotingState_WithValidCookie_Returns200()
    {
        var client = CreateAuthenticatedClient();
        var loginResponse = await client.PostAsJsonAsync(
            "/api/admin/login",
            new { password = TestPassword }
        );
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var response = await client.GetAsync("/api/admin/voting-state");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task AdminStartVoting_WithValidCookie_Returns200()
    {
        var client = CreateAuthenticatedClient();
        var loginResponse = await client.PostAsJsonAsync(
            "/api/admin/login",
            new { password = TestPassword }
        );
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var response = await client.PostAsync("/api/admin/voting/start", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task AdminEndVoting_WithValidCookie_Returns200()
    {
        var client = CreateAuthenticatedClient();
        var loginResponse = await client.PostAsJsonAsync(
            "/api/admin/login",
            new { password = TestPassword }
        );
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var response = await client.PostAsync("/api/admin/voting/end", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // ---------------------------------------------------------------------------
    // Protected admin route — authenticated → 200 (original)
    // ---------------------------------------------------------------------------

    [Fact]
    public async Task AdminResults_WithValidCookie_Returns200()
    {
        // Arrange — log in first so the cookie container holds admin_auth
        var client = CreateAuthenticatedClient();
        var loginResponse = await client.PostAsJsonAsync(
            "/api/admin/login",
            new { password = TestPassword }
        );
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Act
        var response = await client.GetAsync("/api/admin/results");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // ---------------------------------------------------------------------------
    // Local response DTOs for deserialization
    // ---------------------------------------------------------------------------

    private record AuthStatusResponse(bool Authenticated);
}
