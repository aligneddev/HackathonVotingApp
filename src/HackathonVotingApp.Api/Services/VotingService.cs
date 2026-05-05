using HackathonVotingApp.Api.Data;
using HackathonVotingApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HackathonVotingApp.Api.Services;

public class VotingService(AppDbContext db) : IVotingService
{
    public async Task<bool> CastVoteAsync(Guid presentationId)
    {
        var presentationExists = await db.Presentations.AnyAsync(p => p.Id == presentationId);
        if (!presentationExists)
            return false;

        var alreadyVoted = await db.Votes.AnyAsync(v => v.PresentationId == presentationId);
        if (alreadyVoted)
            return false;

        db.Votes.Add(new Vote { PresentationId = presentationId });
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetVoteCountAsync(Guid presentationId) =>
        await db.Votes.CountAsync(v => v.PresentationId == presentationId);
}
