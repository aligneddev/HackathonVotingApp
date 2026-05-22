using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HackathonVotingApp.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddVoterNameToVotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VoterName",
                table: "Votes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: ""
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "VoterName", table: "Votes");
        }
    }
}
