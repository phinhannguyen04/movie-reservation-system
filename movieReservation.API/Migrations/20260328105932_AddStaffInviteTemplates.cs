using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MovieReservation.Migrations
{
    /// <inheritdoc />
    public partial class AddStaffInviteTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StaffInviteEmailSubject",
                table: "SystemSettings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StaffInviteEmailTemplate",
                table: "SystemSettings",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StaffInviteEmailSubject",
                table: "SystemSettings");

            migrationBuilder.DropColumn(
                name: "StaffInviteEmailTemplate",
                table: "SystemSettings");
        }
    }
}
