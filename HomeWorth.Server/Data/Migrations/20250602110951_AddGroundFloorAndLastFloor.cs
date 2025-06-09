using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeWorth.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGroundFloorAndLastFloor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "totalFloors",
                table: "Properties",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "totalFloors",
                table: "Properties");
        }
    }
}
