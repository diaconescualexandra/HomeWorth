using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HomeWorth.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFacilityTabel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Facilities",
                columns: table => new
                {
                    facilityId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    facilityName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Facilities", x => x.facilityId);
                });

            migrationBuilder.CreateTable(
                name: "PropertyFacilities",
                columns: table => new
                {
                    propertyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    facilityId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PropertyFacilities", x => new { x.propertyId, x.facilityId });
                    table.ForeignKey(
                        name: "FK_PropertyFacilities_Facilities_facilityId",
                        column: x => x.facilityId,
                        principalTable: "Facilities",
                        principalColumn: "facilityId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PropertyFacilities_Properties_propertyId",
                        column: x => x.propertyId,
                        principalTable: "Properties",
                        principalColumn: "propertyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Facilities",
                columns: new[] { "facilityId", "facilityName" },
                values: new object[,]
                {
                    { 1, "Swimming Pool" },
                    { 2, "Gym" },
                    { 4, "Security" },
                    { 5, "Elevator" },
                    { 6, "Children's Play Area" },
                    { 7, "Garden" },
                    { 8, "Garage" },
                    { 9, "Balcony" },
                    { 10, "Air Conditioning" },
                    { 11, "Heating" },
                    { 12, "Solar Panels" },
                    { 13, "Outdoor Seating Area" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_PropertyFacilities_facilityId",
                table: "PropertyFacilities",
                column: "facilityId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PropertyFacilities");

            migrationBuilder.DropTable(
                name: "Facilities");
        }
    }
}
