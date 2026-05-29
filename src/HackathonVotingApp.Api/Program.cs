using System.Security.Cryptography;
using System.Text;
using HackathonVotingApp.Api.Data;
using HackathonVotingApp.Api.Models;
using HackathonVotingApp.Api.Services;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var configuredOrigins =
    builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
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
            policy =>
                policy
                    .WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
        );
    });
}

builder.Services.AddEndpointsApiExplorer();
var dataProtectionBuilder = builder.Services
    .AddDataProtection()
    .SetApplicationName("HackathonVotingApp");
if (builder.Environment.IsProduction())
    dataProtectionBuilder.PersistKeysToFileSystem(new DirectoryInfo("/home/site/keys"));

var sqlConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(sqlConnectionString))
{
    builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlServer(sqlConnectionString));
}
else
{
    builder.Services.AddDbContext<AppDbContext>(opt =>
        opt.UseInMemoryDatabase("HackathonVotingApp")
    );
}

builder.Services.AddScoped<IPresentationService, PresentationService>();
builder.Services.AddScoped<IVotingService, VotingService>();
builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();

var app = builder.Build();

if (!string.IsNullOrEmpty(sqlConnectionString))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

if (allowedOrigins.Length > 0)
{
    app.UseCors("FrontendCors");
}

var dataProtector = app
    .Services.GetRequiredService<IDataProtectionProvider>()
    .CreateProtector("AdminAuth");
var adminPassword = app.Configuration["AdminPassword"];
var isProduction = app.Environment.IsProduction();

if (isProduction && string.IsNullOrEmpty(adminPassword))
    throw new InvalidOperationException(
        "ADMIN_PASSWORD environment variable is required in production"
    );

const string AdminAuthCookieName = "admin_auth";
const string AdminAuthValue = "admin:authenticated";

bool IsAuthenticated(HttpContext ctx)
{
    var cookie = ctx.Request.Cookies[AdminAuthCookieName];
    if (cookie is null)
        return false;
    try
    {
        return dataProtector.Unprotect(cookie) == AdminAuthValue;
    }
    catch (Exception ex)
    {
        app.Logger.LogDebug(ex, "Failed to unprotect admin auth cookie");
        return false;
    }
}

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy" }));

app.MapPost(
    "/api/admin/login",
    (LoginRequest req, HttpContext ctx) =>
    {
        if (string.IsNullOrEmpty(adminPassword))
            return Results.StatusCode(401);

        var providedBytes = Encoding.UTF8.GetBytes(req.Password ?? "");
        var adminBytes = Encoding.UTF8.GetBytes(adminPassword);
        if (!CryptographicOperations.FixedTimeEquals(providedBytes, adminBytes))
        {
            app.Logger.LogWarning(
                "Failed admin login attempt from {IP}",
                ctx.Connection.RemoteIpAddress
            );
            return Results.StatusCode(401);
        }

        var token = dataProtector.Protect(AdminAuthValue);
        ctx.Response.Cookies.Append(
            AdminAuthCookieName,
            token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = isProduction,
                SameSite = isProduction ? SameSiteMode.None : SameSiteMode.Lax,
                Path = "/",
            }
        );
        return Results.Ok();
    }
);

app.MapPost(
    "/api/admin/logout",
    (HttpContext ctx) =>
    {
        ctx.Response.Cookies.Delete(
            AdminAuthCookieName,
            new CookieOptions
            {
                Path = "/",
                HttpOnly = true,
                Secure = isProduction,
                SameSite = isProduction ? SameSiteMode.None : SameSiteMode.Lax,
            }
        );
        return Results.Ok();
    }
);

app.MapGet(
    "/api/admin/auth-status",
    (HttpContext ctx) => Results.Ok(new { authenticated = IsAuthenticated(ctx) })
);

var presentations = app.MapGroup("/api/presentations");

presentations.MapGet(
    "/",
    async (IPresentationService service) => Results.Ok(await service.GetAllAsync())
);

presentations.MapPost(
    "/",
    async (
        HackathonVotingApp.Api.Models.CreatePresentationRequest request,
        IPresentationService service
    ) =>
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
    async (
        Guid id,
        HackathonVotingApp.Api.Models.UpdatePresentationRequest request,
        IPresentationService service
    ) =>
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

var votes = app.MapGroup("/api/votes");

votes.MapPost(
    "/ballots",
    async (
        HackathonVotingApp.Api.Models.SubmitBallotRequest request,
        IVotingService votingService
    ) =>
    {
        var result = await votingService.SubmitBallotAsync(request);
        if (result.Success)
            return Results.Created("/api/votes/ballots", null);

        return result.Error switch
        {
            HackathonVotingApp.Api.Models.SubmitBallotError.VotingClosed => Results.StatusCode(
                StatusCodes.Status403Forbidden
            ),
            HackathonVotingApp.Api.Models.SubmitBallotError.DuplicateBallot => Results.Conflict(),
            HackathonVotingApp.Api.Models.SubmitBallotError.InvalidVoter => Results.BadRequest(
                new
                {
                    error = "InvalidVoter",
                    message = "Voter alias must be 3–32 characters and can contain letters, numbers, and spaces.",
                }
            ),
            HackathonVotingApp.Api.Models.SubmitBallotError.InvalidBallot => Results.BadRequest(
                new
                {
                    error = "InvalidBallot",
                    message = "The ballot entries are invalid. Ensure you have ranked all required presentations.",
                }
            ),
            _ => Results.BadRequest(new { error = "Unknown" }),
        };
    }
);

app.MapGet(
    "/api/leaderboard",
    async (ILeaderboardService svc) => Results.Ok(await svc.GetLeaderboardAsync())
);

var admin = app.MapGroup("/api/admin")
    .AddEndpointFilter(async (ctx, next) =>
    {
        if (!IsAuthenticated(ctx.HttpContext))
            return Results.StatusCode(401);
        return await next(ctx);
    });

admin.MapGet(
    "/results",
    async (IVotingService votingService) => Results.Ok(await votingService.GetAdminResultsAsync())
);

admin.MapGet(
    "/votes",
    async (IVotingService votingService) => Results.Ok(await votingService.GetAdminVotesAsync())
);

admin.MapGet(
    "/voting-state",
    async (IVotingService votingService) => Results.Ok(await votingService.GetVotingStateAsync())
);

admin.MapPost(
    "/voting/start",
    async (IVotingService votingService) =>
        Results.Ok(await votingService.SetVotingStateAsync(true))
);

admin.MapPost(
    "/voting/end",
    async (IVotingService votingService) =>
        Results.Ok(await votingService.SetVotingStateAsync(false))
);

app.Run();

public partial class Program { }
