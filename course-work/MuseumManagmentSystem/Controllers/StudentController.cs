using Azure.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using MuseumManagmentSystem.Entities;
using MuseumManagmentSystem.Infrastructure.Data;
using MuseumManagmentSystem.Infrastructure.RequestDTOs.StudentRequests;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.StudentResponses;
using System.Data;

namespace MuseumManagmentSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StudentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudentController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("getstudents")]
        public async Task<ActionResult<GetStudentsDTO>> GetStudents([FromQuery] string? studentName, [FromQuery] string? partnerName,
   [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.Students.Where(s => s.IsDeleted == false && s.Partner.IsDeleted == false && s.Partner.Type.IsDeleted == false);
            if (!string.IsNullOrWhiteSpace(studentName))
            {
                query = query.Where(s => (s.FName + " " + s.LName).Contains(studentName));
            }
            if (!string.IsNullOrWhiteSpace(partnerName))
            {
                query = query.Where(s => s.Partner.PartnerName.Contains(partnerName));
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
                if (sortBy.Equals("fName", StringComparison.OrdinalIgnoreCase))
                {
                    query = isDesc ? query.OrderByDescending(s => s.FName) : query.OrderBy(s => s.FName);
                }
                else if (sortBy.Equals("lName", StringComparison.OrdinalIgnoreCase))
                {
                    query = isDesc ? query.OrderByDescending(s => s.LName) : query.OrderBy(s => s.LName);
                }
                else
                {
                    query = isDesc ? query.OrderByDescending(s => s.Partner.PartnerName) : query.OrderBy(s => s.Partner.PartnerName);
                }
            }
                
            var students = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(s => new GetStudentsDTO
            {
                ID = s.ID,
                FullName = s.FName + " " + s.LName,
                PartnerName = s.Partner.PartnerName
            }).ToListAsync();
            return Ok(students); 
        }


        [HttpGet("getstudent/{studentId}")]
        public async Task<ActionResult<GetStudentDTO>> GetStudent(int studentId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.ID == studentId);
            return Ok(student);
        }

        [HttpPost("addstudent")]
        public async Task<ActionResult> AddStudent([FromBody] AddStudentDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.FName))
            {
                return BadRequest("First name is required");
            }
            if (string.IsNullOrWhiteSpace(request.LName))
            {
                return BadRequest("Last name is required");
            }

            var partner = await _context.Partners.FirstOrDefaultAsync(p => p.ID == request.PartnerID && p.IsDeleted == false && p.Type.IsDeleted == false); 
            if(partner == null)
            {
                return BadRequest("Partner not found");
            }
            int maxID = 900001;
            if (_context.Students.Count() > 0)
            {
                maxID = await _context.Students.MaxAsync(s => s.ID);

            }
            var newStudent = new Student
            {
                ID = maxID + 1,
                DT = DateTime.Now,
                FName = request.FName,
                LName = request.LName,
                PartnerID = request.PartnerID, 
                IsDeleted = false, 
                DltDT = null
            };
            _context.Students.Add(newStudent);
            await _context.SaveChangesAsync();
           
            return Ok();
        }

        [HttpPost("editstudent")]
        public async Task<ActionResult> EditStudent([FromBody] UpdateStudentDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.FName))
            {
                return BadRequest("First name is required");
            }
            if (string.IsNullOrWhiteSpace(request.LName))
            {
                return BadRequest("Last name is required");
            }

            var partner = await _context.Partners.FirstOrDefaultAsync(p => p.ID == request.PartnerID && p.IsDeleted == false && p.Type.IsDeleted == false);
            if (partner == null)
            {
                return BadRequest("Partner not found");
            }
            var student = await _context.Students.FirstOrDefaultAsync(s => s.ID == request.ID && s.IsDeleted == false);
            if (student == null)
            {
                return BadRequest("Student not found");
            }
            student.FName = request.FName;
            student.LName = request.LName;
            student.PartnerID = request.PartnerID;

            await _context.SaveChangesAsync();
            return Ok();
        }


        [HttpDelete("deletestudent/{studentId}")]
        public async Task<IActionResult> DeleteStudent(int studentId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.ID == studentId);

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
