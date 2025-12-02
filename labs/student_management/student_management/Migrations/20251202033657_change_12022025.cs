using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace student_management.Migrations
{
    /// <inheritdoc />
    public partial class change_12022025 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_User",
                table: "User");

            migrationBuilder.RenameTable(
                name: "User",
                newName: "user");

            migrationBuilder.RenameColumn(
                name: "Username",
                table: "user",
                newName: "username");

            migrationBuilder.RenameColumn(
                name: "Role",
                table: "user",
                newName: "role");

            migrationBuilder.RenameColumn(
                name: "Email",
                table: "user",
                newName: "email");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "user",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "user",
                newName: "password_hash");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "user",
                newName: "is_active");

            migrationBuilder.RenameColumn(
                name: "FullName",
                table: "user",
                newName: "full_name");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "user",
                newName: "created_at");

            migrationBuilder.AddPrimaryKey(
                name: "PK_user",
                table: "user",
                column: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_user",
                table: "user");

            migrationBuilder.RenameTable(
                name: "user",
                newName: "User");

            migrationBuilder.RenameColumn(
                name: "username",
                table: "User",
                newName: "Username");

            migrationBuilder.RenameColumn(
                name: "role",
                table: "User",
                newName: "Role");

            migrationBuilder.RenameColumn(
                name: "email",
                table: "User",
                newName: "Email");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "User",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "password_hash",
                table: "User",
                newName: "PasswordHash");

            migrationBuilder.RenameColumn(
                name: "is_active",
                table: "User",
                newName: "IsActive");

            migrationBuilder.RenameColumn(
                name: "full_name",
                table: "User",
                newName: "FullName");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "User",
                newName: "CreatedAt");

            migrationBuilder.AddPrimaryKey(
                name: "PK_User",
                table: "User",
                column: "Id");
        }
    }
}
