using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HackathonVotingApp.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCurrentPresentationToVotingState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CurrentPresentationId",
                table: "VotingStates",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "PresentationStartedAt",
                table: "VotingStates",
                type: "datetimeoffset",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentPresentationId",
                table: "VotingStates");

            migrationBuilder.DropColumn(
                name: "PresentationStartedAt",
                table: "VotingStates");
        }
    }
}
