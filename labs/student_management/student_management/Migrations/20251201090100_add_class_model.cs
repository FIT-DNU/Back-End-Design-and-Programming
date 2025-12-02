using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace student_management.Migrations
{
    /// <inheritdoc />
    public partial class add_class_model : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ClassID",
                table: "Student",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Class",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Class", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Student_ClassID",
                table: "Student",
                column: "ClassID");

            migrationBuilder.AddForeignKey(
                name: "FK_Student_Class_ClassID",
                table: "Student",
                column: "ClassID",
                principalTable: "Class",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Student_Class_ClassID",
                table: "Student");

            migrationBuilder.DropTable(
                name: "Class");

            migrationBuilder.DropIndex(
                name: "IX_Student_ClassID",
                table: "Student");

            migrationBuilder.DropColumn(
                name: "ClassID",
                table: "Student");
        }
    }
}
