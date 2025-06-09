using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeWorth.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOffer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Offers",
                columns: table => new
                {
                    offerId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    propertyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    buyerId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    offeredAmount = table.Column<double>(type: "float", nullable: false),
                    status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Offers", x => x.offerId);
                    table.ForeignKey(
                        name: "FK_Offers_AspNetUsers_buyerId",
                        column: x => x.buyerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Offers_Properties_propertyId",
                        column: x => x.propertyId,
                        principalTable: "Properties",
                        principalColumn: "propertyId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Offers_buyerId",
                table: "Offers",
                column: "buyerId");

            migrationBuilder.CreateIndex(
                name: "IX_Offers_propertyId",
                table: "Offers",
                column: "propertyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Offers");
        }
    }
}
