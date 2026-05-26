using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HackathonVotingApp.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenameVoterNameToVoterAliasToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Votes_SessionId_NormalizedVoterName",
                table: "Votes");

            migrationBuilder.DropColumn(
                name: "NormalizedVoterName",
                table: "Votes");

            migrationBuilder.RenameColumn(
                name: "VoterName",
                table: "Votes",
                newName: "VoterAliasToken");

            migrationBuilder.AddColumn<string>(
                name: "NormalizedVoterAliasToken",
                table: "Votes",
                type: "nvarchar(12)",
                maxLength: 12,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Votes_SessionId_NormalizedVoterAliasToken",
                table: "Votes",
                columns: new[] { "SessionId", "NormalizedVoterAliasToken" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Votes_SessionId_NormalizedVoterAliasToken",
                table: "Votes");

            migrationBuilder.DropColumn(
                name: "NormalizedVoterAliasToken",
                table: "Votes");

            migrationBuilder.RenameColumn(
                name: "VoterAliasToken",
                table: "Votes",
                newName: "VoterName");

            migrationBuilder.AddColumn<string>(
                name: "NormalizedVoterName",
                table: "Votes",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Votes_SessionId_NormalizedVoterName",
                table: "Votes",
                columns: new[] { "SessionId", "NormalizedVoterName" });
        }
    }
}
