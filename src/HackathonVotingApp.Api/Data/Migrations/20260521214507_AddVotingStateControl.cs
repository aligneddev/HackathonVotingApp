using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HackathonVotingApp.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddVotingStateControl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VotingStates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    IsOpen = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VotingStates", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VotingStates");
        }
    }
}
