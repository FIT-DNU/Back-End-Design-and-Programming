using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace student_management.Models
{
    [Table("user")] 
    public class User
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
        [StringLength(50, ErrorMessage = "Tên đăng nhập không được quá 50 ký tự")]
        [Column("username")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [Column("password_hash")]
        public string PasswordHash { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [StringLength(100)]
        [Column("full_name")]
        public string? FullName { get; set; }

        [Column("role")]
        public string Role { get; set; } = "User";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;
    }
}
