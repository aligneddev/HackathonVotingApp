using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HackathonVotingApp.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBallotSessionAndWeightedScoring : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CurrentSessionId",
                table: "VotingStates",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "NormalizedVoterName",
                table: "Votes",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "SessionId",
                table: "Votes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Votes_SessionId_NormalizedVoterName",
                table: "Votes",
                columns: new[] { "SessionId", "NormalizedVoterName" });

            migrationBuilder.CreateIndex(
                name: "IX_Votes_SessionId_PresentationId",
                table: "Votes",
                columns: new[] { "SessionId", "PresentationId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Votes_SessionId_NormalizedVoterName",
                table: "Votes");

            migrationBuilder.DropIndex(
                name: "IX_Votes_SessionId_PresentationId",
                table: "Votes");

            migrationBuilder.DropColumn(
                name: "CurrentSessionId",
                table: "VotingStates");

            migrationBuilder.DropColumn(
                name: "NormalizedVoterName",
                table: "Votes");

            migrationBuilder.DropColumn(
                name: "SessionId",
                table: "Votes");
        }
    }
}
