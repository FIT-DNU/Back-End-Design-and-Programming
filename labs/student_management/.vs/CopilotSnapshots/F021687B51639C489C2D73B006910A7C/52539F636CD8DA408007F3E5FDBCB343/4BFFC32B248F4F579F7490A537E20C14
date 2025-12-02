using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using student_management.Data;
using student_management.Models;

public class StudentStatsViewComponent : ViewComponent
{
    private readonly student_managementContext _context;

    public StudentStatsViewComponent(student_managementContext context)
    {
        _context = context;
    }

    public async Task<IViewComponentResult> InvokeAsync()
    {
        var model = new StudentStatsViewModel
        {
            TotalStudents = await _context.Student.CountAsync(),
            MaleCount = await _context.Student.CountAsync(s => s.Gender == 1),
            FemaleCount = await _context.Student.CountAsync(s => s.Gender == 0),
            AverageAge = await _context.Student.AnyAsync()
                ? (int)await _context.Student.AverageAsync(s => DateTime.Now.Year - s.DateOfBirth.Year)
                : 0,
            RegionsCount = await _context.Student.Select(s => s.Region).Distinct().CountAsync()
        };

        return View(model);
    }
}
