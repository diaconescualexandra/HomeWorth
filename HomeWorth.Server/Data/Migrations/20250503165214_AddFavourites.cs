using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeWorth.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFavourites : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Favourites",
                columns: table => new
                {
                    favouriteId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    buyerId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    propertyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Favourites", x => x.favouriteId);
                    table.ForeignKey(
                        name: "FK_Favourites_AspNetUsers_buyerId",
                        column: x => x.buyerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Favourites_Properties_propertyId",
                        column: x => x.propertyId,
                        principalTable: "Properties",
                        principalColumn: "propertyId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Favourites_buyerId",
                table: "Favourites",
                column: "buyerId");

            migrationBuilder.CreateIndex(
                name: "IX_Favourites_propertyId",
                table: "Favourites",
                column: "propertyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Favourites");
        }
    }
}
