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

app.Run();

public partial class Program { }
