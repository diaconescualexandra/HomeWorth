using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeWorth.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddViewPropertyTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PropertyViews",
                columns: table => new
                {
                    propertyViewId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    buyerId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    propertyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    viewedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    viewsCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PropertyViews", x => x.propertyViewId);
                    table.ForeignKey(
                        name: "FK_PropertyViews_AspNetUsers_buyerId",
                        column: x => x.buyerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PropertyViews_Properties_propertyId",
                        column: x => x.propertyId,
                        principalTable: "Properties",
                        principalColumn: "propertyId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PropertyViews_buyerId",
                table: "PropertyViews",
                column: "buyerId");

            migrationBuilder.CreateIndex(
                name: "IX_PropertyViews_propertyId",
                table: "PropertyViews",
                column: "propertyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PropertyViews");
        }
    }
}
