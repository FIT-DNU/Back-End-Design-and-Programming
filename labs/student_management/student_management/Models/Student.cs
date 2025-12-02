using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace student_management.Models
{
    [Table("student")]
    public class Student
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("class_id")]
        [Display(Name = "Lớp học")]
        public int ClassID { get; set; }

        [Column("name")]
        [Display(Name = "Họ và tên")]
        public string Name { get; set; }

        [Column("date_of_birth")]
        [Display(Name = "Ngày sinh")]
        public DateTime DateOfBirth { get; set; }

        [Column("img_url")]
        [Display(Name = "Ảnh")]
        public string ImgUrl { get; set; }

        [Column("gender")]
        [Display(Name = "Giới tính")]
        public int Gender { get; set; }

        [Column("email")]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Column("phone_number")]
        [Display(Name = "Số điện thoại")]
        public string PhoneNumber { get; set; }

        [Column("region")]
        [Display(Name = "Khu vực")]
        public string Region { get; set; }

        public Class? Class { get; set; } = null!;
    }
}
