using HackathonVotingApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HackathonVotingApp.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Presentation> Presentations => Set<Presentation>();
    public DbSet<Vote> Votes => Set<Vote>();
    public DbSet<VotingState> VotingStates => Set<VotingState>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<VotingState>().Property(v => v.Id).ValueGeneratedNever();
    }
}
