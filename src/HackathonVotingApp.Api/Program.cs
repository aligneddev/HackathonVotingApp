using HackathonVotingApp.Api.Data;
using HackathonVotingApp.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var configuredOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
var allowedOrigins = configuredOrigins
    .Where(origin => !string.IsNullOrWhiteSpace(origin))
    .Select(origin => origin.Trim())
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

if (builder.Environment.IsDevelopment() && allowedOrigins.Length == 0)
{
    allowedOrigins = ["http://localhost:5173"];
}

if (allowedOrigins.Length > 0)
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(
            "FrontendCors",
            policy => policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()
        );
    });
}

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseInMemoryDatabase("HackathonVotingApp"));
builder.Services.AddScoped<IPresentationService, PresentationService>();
builder.Services.AddScoped<IVotingService, VotingService>();
builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();

var app = builder.Build();

if (allowedOrigins.Length > 0)
{
    app.UseCors("FrontendCors");
}

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

var presentations = app.MapGroup("/presentations");

presentations.MapGet(
    "/",
    async (IPresentationService service) => Results.Ok(await service.GetAllAsync())
);

presentations.MapPost(
    "/",
    async (HackathonVotingApp.Api.Models.CreatePresentationRequest request, IPresentationService service) =>
    {
        var result = await service.CreateAsync(request);
        return Results.Created($"/presentations/{result.Id}", result);
    }
);

presentations.MapGet(
    "/{id:guid}",
    async (Guid id, IPresentationService service) =>
    {
        var result = await service.GetByIdAsync(id);
        return result is null ? Results.NotFound() : Results.Ok(result);
    }
);

presentations.MapPut(
    "/{id:guid}",
    async (Guid id, HackathonVotingApp.Api.Models.UpdatePresentationRequest request, IPresentationService service) =>
    {
        var result = await service.UpdateAsync(id, request);
        return result is null ? Results.NotFound() : Results.Ok(result);
    }
);

presentations.MapDelete(
    "/{id:guid}",
    async (Guid id, IPresentationService service) =>
    {
        var deleted = await service.DeleteAsync(id);
        return deleted ? Results.NoContent() : Results.NotFound();
    }
);

var votes = app.MapGroup("/votes");

votes.MapPost(
    "/{presentationId:guid}",
    async (Guid presentationId, IVotingService votingService, HttpContext httpContext) =>
    {
        var cookieKey = $"hackathon-voted-{presentationId}";
        if (httpContext.Request.Cookies.ContainsKey(cookieKey))
            return Results.Conflict();

        var success = await votingService.CastVoteAsync(presentationId);
        if (!success)
            return Results.NotFound();

        httpContext.Response.Cookies.Append(
            cookieKey,
            "true",
            new CookieOptions { MaxAge = TimeSpan.FromDays(365) }
        );
        return Results.Created($"/votes/{presentationId}", null);
    }
);

votes.MapGet(
    "/{presentationId:guid}/count",
    async (Guid presentationId, IPresentationService presentationService, IVotingService votingService) =>
    {
        var presentation = await presentationService.GetByIdAsync(presentationId);
        if (presentation is null)
            return Results.NotFound();

        var count = await votingService.GetVoteCountAsync(presentationId);
        return Results.Ok(new { count });
    }
);

app.MapGet("/leaderboard", async (ILeaderboardService svc) =>
    Results.Ok(await svc.GetLeaderboardAsync()));

app.Run();

public partial class Program { }
