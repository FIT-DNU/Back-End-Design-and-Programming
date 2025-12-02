using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace student_management.Models
{
    [Table("class")]
    public class Class
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        [Display(Name = "Tên lớp")]
        public string Name { get; set; }

        [Column("description")]
        [Display(Name = "Mô tả")]
        public string Description { get; set; }

        public ICollection<Student> Students { get; } = new List<Student>();
    }
}
