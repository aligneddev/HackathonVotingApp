using HackathonVotingApp.Api.Data;
using HackathonVotingApp.Api.Models;
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

var app = builder.Build();

if (allowedOrigins.Length > 0)
{
    app.UseCors("FrontendCors");
}

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

var presentations = app.MapGroup("/presentations");

presentations.MapGet(
    "/",
    async (AppDbContext db) => await db.Presentations.Select(p => p.ToResponse()).ToListAsync()
);

presentations.MapPost(
    "/",
    async (CreatePresentationRequest request, AppDbContext db) =>
    {
        var presentation = new Presentation
        {
            Title = request.Title,
            PresenterName = request.PresenterName,
            Description = request.Description ?? string.Empty,
        };
        db.Presentations.Add(presentation);
        await db.SaveChangesAsync();
        return Results.Created($"/presentations/{presentation.Id}", presentation.ToResponse());
    }
);

presentations.MapGet(
    "/{id:guid}",
    async (Guid id, AppDbContext db) =>
    {
        var presentation = await db.Presentations.FindAsync(id);
        return presentation is null ? Results.NotFound() : Results.Ok(presentation.ToResponse());
    }
);

presentations.MapPut(
    "/{id:guid}",
    async (Guid id, UpdatePresentationRequest request, AppDbContext db) =>
    {
        var presentation = await db.Presentations.FindAsync(id);
        if (presentation is null)
            return Results.NotFound();

        presentation.Title = request.Title;
        presentation.PresenterName = request.PresenterName;
        presentation.Description = request.Description ?? string.Empty;
        await db.SaveChangesAsync();
        return Results.Ok(presentation.ToResponse());
    }
);

presentations.MapDelete(
    "/{id:guid}",
    async (Guid id, AppDbContext db) =>
    {
        var presentation = await db.Presentations.FindAsync(id);
        if (presentation is null)
            return Results.NotFound();

        db.Presentations.Remove(presentation);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
);

app.Run();

public partial class Program { }
