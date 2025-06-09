using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeWorth.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class UserPropertiesRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SellerId",
                table: "Properties",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Properties_SellerId",
                table: "Properties",
                column: "SellerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Properties_AspNetUsers_SellerId",
                table: "Properties",
                column: "SellerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Properties_AspNetUsers_SellerId",
                table: "Properties");

            migrationBuilder.DropIndex(
                name: "IX_Properties_SellerId",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "SellerId",
                table: "Properties");
        }
    }
}
