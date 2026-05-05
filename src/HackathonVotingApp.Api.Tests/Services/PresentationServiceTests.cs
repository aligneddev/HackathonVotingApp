using FluentAssertions;
using HackathonVotingApp.Api.Data;
using HackathonVotingApp.Api.Models;
using HackathonVotingApp.Api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace HackathonVotingApp.Api.Tests.Services;

public class PresentationServiceTests
{
    private static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"TestDb-{Guid.NewGuid()}")
            .Options;
        return new AppDbContext(options);
    }

    // --- GetAllAsync ---

    [Fact]
    public async Task GetAllAsync_EmptyDb_ReturnsEmptyList()
    {
        // Arrange
        await using var db = CreateDb();
        var svc = new PresentationService(db);

        // Act
        var result = await svc.GetAllAsync();

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllAsync_WithPresentations_ReturnsAll()
    {
        // Arrange
        await using var db = CreateDb();
        db.Presentations.AddRange(
            new Presentation { Title = "Talk One", PresenterName = "Alice" },
            new Presentation { Title = "Talk Two", PresenterName = "Bob" }
        );
        await db.SaveChangesAsync();
        var svc = new PresentationService(db);

        // Act
        var result = await svc.GetAllAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(p => p.Title == "Talk One");
        result.Should().Contain(p => p.Title == "Talk Two");
    }

    // --- GetByIdAsync ---

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsPresentationResponse()
    {
        // Arrange
        await using var db = CreateDb();
        var presentation = new Presentation { Title = "My Talk", PresenterName = "Carol", Description = "Cool stuff" };
        db.Presentations.Add(presentation);
        await db.SaveChangesAsync();
        var svc = new PresentationService(db);

        // Act
        var result = await svc.GetByIdAsync(presentation.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(presentation.Id);
        result.Title.Should().Be("My Talk");
        result.PresenterName.Should().Be("Carol");
        result.Description.Should().Be("Cool stuff");
    }

    [Fact]
    public async Task GetByIdAsync_NonExistentId_ReturnsNull()
    {
        // Arrange
        await using var db = CreateDb();
        var svc = new PresentationService(db);

        // Act
        var result = await svc.GetByIdAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }

    // --- CreateAsync ---

    [Fact]
    public async Task CreateAsync_ValidRequest_ReturnsPresentationResponse()
    {
        // Arrange
        await using var db = CreateDb();
        var svc = new PresentationService(db);
        var request = new CreatePresentationRequest("AI in Production", "Dan Dev", "Lessons learned");

        // Act
        var result = await svc.CreateAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().NotBeEmpty();
        result.Title.Should().Be("AI in Production");
        result.PresenterName.Should().Be("Dan Dev");
        result.Description.Should().Be("Lessons learned");
    }

    [Fact]
    public async Task CreateAsync_ValidRequest_PersistsToDb()
    {
        // Arrange
        await using var db = CreateDb();
        var svc = new PresentationService(db);
        var request = new CreatePresentationRequest("Persisted Talk", "Eve Eng", "Will it save?");

        // Act
        var result = await svc.CreateAsync(request);

        // Assert
        var saved = await db.Presentations.FindAsync(result.Id);
        saved.Should().NotBeNull();
        saved!.Title.Should().Be("Persisted Talk");
    }

    [Fact]
    public async Task CreateAsync_NullDescription_DefaultsToEmptyString()
    {
        // Arrange
        await using var db = CreateDb();
        var svc = new PresentationService(db);
        var request = new CreatePresentationRequest("No Desc Talk", "Frank", null!);

        // Act
        var result = await svc.CreateAsync(request);

        // Assert
        result.Description.Should().Be(string.Empty);
    }

    // --- UpdateAsync ---

    [Fact]
    public async Task UpdateAsync_ExistingId_ReturnsUpdatedResponse()
    {
        // Arrange
        await using var db = CreateDb();
        var presentation = new Presentation { Title = "Old Title", PresenterName = "Gina", Description = "Old desc" };
        db.Presentations.Add(presentation);
        await db.SaveChangesAsync();
        var svc = new PresentationService(db);
        var request = new UpdatePresentationRequest("New Title", "Gina", "New desc");

        // Act
        var result = await svc.UpdateAsync(presentation.Id, request);

        // Assert
        result.Should().NotBeNull();
        result!.Title.Should().Be("New Title");
        result.Description.Should().Be("New desc");
    }

    [Fact]
    public async Task UpdateAsync_NonExistentId_ReturnsNull()
    {
        // Arrange
        await using var db = CreateDb();
        var svc = new PresentationService(db);
        var request = new UpdatePresentationRequest("Any Title", "Anyone", "Any desc");

        // Act
        var result = await svc.UpdateAsync(Guid.NewGuid(), request);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateAsync_UpdatesAllFields()
    {
        // Arrange
        await using var db = CreateDb();
        var presentation = new Presentation { Title = "A", PresenterName = "B", Description = "C" };
        db.Presentations.Add(presentation);
        await db.SaveChangesAsync();
        var svc = new PresentationService(db);
        var request = new UpdatePresentationRequest("Updated Title", "Updated Presenter", "Updated Desc");

        // Act
        var result = await svc.UpdateAsync(presentation.Id, request);

        // Assert
        result.Should().NotBeNull();
        result!.Title.Should().Be("Updated Title");
        result.PresenterName.Should().Be("Updated Presenter");
        result.Description.Should().Be("Updated Desc");
        var saved = await db.Presentations.FindAsync(presentation.Id);
        saved!.Title.Should().Be("Updated Title");
        saved.PresenterName.Should().Be("Updated Presenter");
        saved.Description.Should().Be("Updated Desc");
    }

    // --- DeleteAsync ---

    [Fact]
    public async Task DeleteAsync_ExistingId_ReturnsTrue()
    {
        // Arrange
        await using var db = CreateDb();
        var presentation = new Presentation { Title = "To Delete", PresenterName = "Hank" };
        db.Presentations.Add(presentation);
        await db.SaveChangesAsync();
        var svc = new PresentationService(db);

        // Act
        var result = await svc.DeleteAsync(presentation.Id);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteAsync_NonExistentId_ReturnsFalse()
    {
        // Arrange
        await using var db = CreateDb();
        var svc = new PresentationService(db);

        // Act
        var result = await svc.DeleteAsync(Guid.NewGuid());

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAsync_ExistingId_RemovesFromDb()
    {
        // Arrange
        await using var db = CreateDb();
        var presentation = new Presentation { Title = "Gone Soon", PresenterName = "Iris" };
        db.Presentations.Add(presentation);
        await db.SaveChangesAsync();
        var svc = new PresentationService(db);

        // Act
        await svc.DeleteAsync(presentation.Id);

        // Assert
        var saved = await db.Presentations.FindAsync(presentation.Id);
        saved.Should().BeNull();
    }
}
