using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace student_management.Migrations
{
    /// <inheritdoc />
    public partial class change : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Student_Class_ClassID",
                table: "Student");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Student",
                table: "Student");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Class",
                table: "Class");

            migrationBuilder.RenameTable(
                name: "Student",
                newName: "student");

            migrationBuilder.RenameTable(
                name: "Class",
                newName: "class");

            migrationBuilder.RenameColumn(
                name: "Region",
                table: "student",
                newName: "region");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "student",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Gender",
                table: "student",
                newName: "gender");

            migrationBuilder.RenameColumn(
                name: "Email",
                table: "student",
                newName: "email");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "student",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "PhoneNumber",
                table: "student",
                newName: "phone_number");

            migrationBuilder.RenameColumn(
                name: "ImgUrl",
                table: "student",
                newName: "img_url");

            migrationBuilder.RenameColumn(
                name: "DateOfBirth",
                table: "student",
                newName: "date_of_birth");

            migrationBuilder.RenameColumn(
                name: "ClassID",
                table: "student",
                newName: "class_id");

            migrationBuilder.RenameIndex(
                name: "IX_Student_ClassID",
                table: "student",
                newName: "IX_student_class_id");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "class",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "class",
                newName: "description");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "class",
                newName: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_student",
                table: "student",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_class",
                table: "class",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_student_class_class_id",
                table: "student",
                column: "class_id",
                principalTable: "class",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_student_class_class_id",
                table: "student");

            migrationBuilder.DropPrimaryKey(
                name: "PK_student",
                table: "student");

            migrationBuilder.DropPrimaryKey(
                name: "PK_class",
                table: "class");

            migrationBuilder.RenameTable(
                name: "student",
                newName: "Student");

            migrationBuilder.RenameTable(
                name: "class",
                newName: "Class");

            migrationBuilder.RenameColumn(
                name: "region",
                table: "Student",
                newName: "Region");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "Student",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "gender",
                table: "Student",
                newName: "Gender");

            migrationBuilder.RenameColumn(
                name: "email",
                table: "Student",
                newName: "Email");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Student",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "phone_number",
                table: "Student",
                newName: "PhoneNumber");

            migrationBuilder.RenameColumn(
                name: "img_url",
                table: "Student",
                newName: "ImgUrl");

            migrationBuilder.RenameColumn(
                name: "date_of_birth",
                table: "Student",
                newName: "DateOfBirth");

            migrationBuilder.RenameColumn(
                name: "class_id",
                table: "Student",
                newName: "ClassID");

            migrationBuilder.RenameIndex(
                name: "IX_student_class_id",
                table: "Student",
                newName: "IX_Student_ClassID");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "Class",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "Class",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Class",
                newName: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Student",
                table: "Student",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Class",
                table: "Class",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Student_Class_ClassID",
                table: "Student",
                column: "ClassID",
                principalTable: "Class",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
