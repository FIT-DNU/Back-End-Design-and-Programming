using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using student_management.Models;

namespace student_management.Data
{
    public class student_managementContext : DbContext
    {
        public student_managementContext (DbContextOptions<student_managementContext> options)
            : base(options)
        {
        }

        public DbSet<Student> Student { get; set; } = default!;

        public DbSet<Class> Class { get; set; } = default!;

        public DbSet<User> User { get; set; } = default!;
    }
}
