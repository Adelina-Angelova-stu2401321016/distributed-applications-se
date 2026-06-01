using Azure.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using MuseumManagmentSystem.Entities;
using MuseumManagmentSystem.Infrastructure.Data;
using MuseumManagmentSystem.Infrastructure.RequestDTOs.StudyRequests;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.StudyResponses;
using System.Data;

namespace MuseumManagmentSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StudyStudentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudyStudentController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("getstudystudents/{studyId}")]
        public async Task<ActionResult<GetStudyStudentsDTO>> GetStudyStudents(int studyId, [FromQuery] string? studentName, [FromQuery] string? partnerName,
   [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.StudyStudents.Where(a => a.IsDeleted == false && a.StudyID == studyId && a.Study.IsDeleted == false && a.Student.IsDeleted == false && a.Student.Partner.IsDeleted == false && a.Student.Partner.Type.IsDeleted == false);
            if (!string.IsNullOrWhiteSpace(studentName))
            {
                query = query.Where(s => (s.Student.FName + " " + s.Student.LName).Contains(studentName));
            }
            if (!string.IsNullOrWhiteSpace(partnerName))
            {
                query = query.Where(s => s.Student.Partner.PartnerName.Contains(partnerName));
            }
            if (pageNum < 1) return BadRequest("Page number cannot be less than 1.");
            if (pageSize < 1 || pageSize > 100) return BadRequest("Page size should be number between 1 and 100");
            bool isDesc = false;
            if (sortDirection is null || sortDirection == 0)
            {
                isDesc = false;
            }
            else if (sortDirection == 1)
            {
                isDesc = true;
            }

            if (sortBy != null)
            {
                if (sortBy.Equals("partnerName", StringComparison.OrdinalIgnoreCase))
                {
                    query = isDesc ? query.OrderByDescending(a => a.Student.Partner.PartnerName) : query.OrderBy(a => a.Student.Partner.PartnerName);
                }
                else
                {
                    query = isDesc ? query.OrderByDescending(a => a.Student.LName) : query.OrderBy(a => a.Student.LName);
                }
            }

            var students = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(s => new GetStudyStudentsDTO
            {
                ID = s.ID,
                StudentID = s.StudentID,
                FullName = s.Student.FName + " " + s.Student.LName,
                PartnerName = s.Student.Partner.PartnerName
            }).ToListAsync();
            return Ok(students);
        }

        [HttpPost("addstudystudent")]
        public async Task<ActionResult> AddStudyStudent([FromBody] AddStudyStudentDTO request)
        {
            var study = await _context.Studies.FirstOrDefaultAsync(s => s.ID == request.StudyID && s.IsDeleted == false);
            if (study == null)
            {
                return BadRequest("Study not found");
            }
            var student = await _context.Students.FirstOrDefaultAsync(s => s.ID == request.StudentID && s.IsDeleted == false && s.Partner.IsDeleted == false && s.Partner.Type.IsDeleted == false);
            if (student == null)
            {
                return BadRequest("Student not found");
            }

            int maxID = 900001;
            if (_context.StudyStudents.Count() > 0)
            {
                maxID = await _context.StudyStudents.MaxAsync(s => s.ID);

            }
            var newStudyStudent = new StudyStudent
            {
                ID = maxID + 1,
                DT = DateTime.Now,
                StudyID = request.StudyID,
                StudentID = request.StudentID, 
                IsDeleted = false, 
                DltDT = null
            };
            _context.StudyStudents.Add(newStudyStudent);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("deletestudystudent/{ssId}")]
        public async Task<IActionResult> DeleteStudyStudent(int ssId)
        {
            var student = await _context.StudyStudents.FirstOrDefaultAsync(s => s.ID == ssId);

            if (student == null)
            {
                return NotFound("Student not found");
            }

            student.IsDeleted = true;
            student.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }

    }
}
