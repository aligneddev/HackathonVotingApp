using HackathonVotingApp.Api.Data;
using HackathonVotingApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HackathonVotingApp.Api.Services;

public class VotingService(AppDbContext db) : IVotingService
{
    private async Task<VotingState> GetOrCreateVotingStateAsync()
    {
        var state = await db.VotingStates.SingleOrDefaultAsync(v => v.Id == 1);
        if (state is not null)
            return state;

        state = new VotingState { Id = 1, IsOpen = true, UpdatedAt = DateTimeOffset.UtcNow };
        db.VotingStates.Add(state);
        await db.SaveChangesAsync();
        return state;
    }

    public async Task<bool> CastVoteAsync(Guid presentationId, int ranking, string? notes)
    {
        var votingState = await GetOrCreateVotingStateAsync();
        if (!votingState.IsOpen)
            return false;

        var presentationExists = await db.Presentations.AnyAsync(p => p.Id == presentationId);
        if (!presentationExists)
            return false;

        var alreadyVoted = await db.Votes.AnyAsync(v => v.PresentationId == presentationId);
        if (alreadyVoted)
            return false;

        db.Votes.Add(
            new Vote
            {
                PresentationId = presentationId,
                Ranking = ranking,
                Notes = notes,
            }
        );
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetVoteCountAsync(Guid presentationId) =>
        await db.Votes.CountAsync(v => v.PresentationId == presentationId);

    public async Task<IReadOnlyList<AdminVoteResultResponse>> GetAdminResultsAsync()
    {
        var summaries = await db
            .Presentations.Select(p => new
            {
                p.Id,
                p.Title,
                p.PresenterName,
                VoteCount = db.Votes.Count(v => v.PresentationId == p.Id),
                AverageRanking = db
                    .Votes.Where(v => v.PresentationId == p.Id)
                    .Select(v => (double?)v.Ranking)
                    .Average(),
            })
            .OrderBy(p => p.AverageRanking == null)
            .ThenBy(p => p.AverageRanking)
            .ThenByDescending(p => p.VoteCount)
            .ThenBy(p => p.Title)
            .ToListAsync();

        var notes = await db
            .Votes.Where(v => v.Notes != null && v.Notes != "")
            .OrderByDescending(v => v.CreatedAt)
            .Select(v => new
            {
                v.PresentationId,
                Note = new VoteNoteResponse(v.Notes!, v.Ranking, v.CreatedAt),
            })
            .ToListAsync();

        var notesByPresentation = notes
            .GroupBy(v => v.PresentationId)
            .ToDictionary(g => g.Key, g => (IReadOnlyList<VoteNoteResponse>)g.Select(v => v.Note).ToList());

        return summaries
            .Select(s =>
                new AdminVoteResultResponse(
                    s.Id,
                    s.Title,
                    s.PresenterName,
                    s.VoteCount,
                    s.AverageRanking,
                    notesByPresentation.GetValueOrDefault(s.Id, Array.Empty<VoteNoteResponse>())
                )
            )
            .ToList();
    }

    public async Task<VotingStateResponse> GetVotingStateAsync()
    {
        var state = await GetOrCreateVotingStateAsync();
        return new VotingStateResponse(state.IsOpen, state.UpdatedAt);
    }

    public async Task<VotingStateResponse> SetVotingStateAsync(bool isOpen)
    {
        var state = await GetOrCreateVotingStateAsync();
        state.IsOpen = isOpen;
        state.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
        return new VotingStateResponse(state.IsOpen, state.UpdatedAt);
    }
}
