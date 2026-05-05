using HackathonVotingApp.Api.Data;
using HackathonVotingApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HackathonVotingApp.Api.Services;

public class PresentationService(AppDbContext db) : IPresentationService
{
    public async Task<IEnumerable<PresentationResponse>> GetAllAsync() =>
        await db.Presentations.Select(p => p.ToResponse()).ToListAsync();

    public async Task<PresentationResponse?> GetByIdAsync(Guid id)
    {
        var presentation = await db.Presentations.FindAsync(id);
        return presentation?.ToResponse();
    }

    public async Task<PresentationResponse> CreateAsync(CreatePresentationRequest request)
    {
        var presentation = new Presentation
        {
            Title = request.Title,
            PresenterName = request.PresenterName,
            Description = request.Description ?? string.Empty,
        };
        db.Presentations.Add(presentation);
        await db.SaveChangesAsync();
        return presentation.ToResponse();
    }

    public async Task<PresentationResponse?> UpdateAsync(Guid id, UpdatePresentationRequest request)
    {
        var presentation = await db.Presentations.FindAsync(id);
        if (presentation is null)
            return null;

        presentation.Title = request.Title;
        presentation.PresenterName = request.PresenterName;
        presentation.Description = request.Description ?? string.Empty;
        await db.SaveChangesAsync();
        return presentation.ToResponse();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var presentation = await db.Presentations.FindAsync(id);
        if (presentation is null)
            return false;

        db.Presentations.Remove(presentation);
        await db.SaveChangesAsync();
        return true;
    }
}
