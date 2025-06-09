using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeWorth.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPropertyFlatHouseImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Properties",
                columns: table => new
                {
                    propertyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    noOfRooms = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    price = table.Column<int>(type: "int", nullable: false),
                    city = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    neighborhood = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    yearBuilt = table.Column<int>(type: "int", nullable: false),
                    size = table.Column<int>(type: "int", nullable: false),
                    date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    latitude = table.Column<double>(type: "float", nullable: true),
                    longitude = table.Column<double>(type: "float", nullable: true),
                    PropertyType = table.Column<int>(type: "int", nullable: false),
                    floorNo = table.Column<int>(type: "int", nullable: true),
                    noOfFloors = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Properties", x => x.propertyId);
                });

            migrationBuilder.CreateTable(
                name: "Image",
                columns: table => new
                {
                    imageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    propertyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    imageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    isFirst = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Image", x => x.imageId);
                    table.ForeignKey(
                        name: "FK_Image_Properties_propertyId",
                        column: x => x.propertyId,
                        principalTable: "Properties",
                        principalColumn: "propertyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Image_propertyId",
                table: "Image",
                column: "propertyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Image");

            migrationBuilder.DropTable(
                name: "Properties");
        }
    }
}
