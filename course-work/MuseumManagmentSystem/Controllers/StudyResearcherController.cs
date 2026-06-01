using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    public class StudyResearcherController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudyResearcherController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("getstudyresearchers/{studyID}")]
        public async Task<ActionResult<GetStudyResearchersDTO>> GetStudyResearchers(int studyID, [FromQuery] string? researcherName, [FromQuery] DateTime? dtCreated,
   [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.StudyResearchers.Where(sr => sr.IsDeleted == false && sr.StudyID == studyID && sr.Study.IsDeleted == false && sr.Researcher.IsDeleted == false && sr.Researcher.UserRole.IsDeleted == false);
            if (!string.IsNullOrWhiteSpace(researcherName))
            {
                query = query.Where(sr => (sr.Researcher.FName + " " + sr.Researcher.LName).Contains(researcherName));
            }
            if (dtCreated.HasValue)
            {
                query = query.Where(a => a.DT.Date == dtCreated.Value.Date);
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
                if (sortBy.Equals("dtCreated", StringComparison.OrdinalIgnoreCase))
                {
                    query = isDesc ? query.OrderByDescending(a => a.DT) : query.OrderBy(a => a.DT);
                }
                else
                {
                    query = isDesc ? query.OrderByDescending(a => a.Researcher.LName) : query.OrderBy(a => a.Researcher.LName);
                }
            }

            var researchers = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(sr => new GetStudyResearchersDTO
            {
                ID = sr.ID,
                ResearcherName = sr.Researcher.FName + " " + sr.Researcher.LName
            }).ToListAsync();

            return Ok(researchers);
        }

       

        [HttpPost("addstudyresearcher")]
        public async Task<ActionResult> AddStudyResearcher([FromBody] AddStudyResearcherDTO request)
        {

            var study = await _context.Studies.FirstOrDefaultAsync(s => s.ID == request.StudyID && s.IsDeleted == false);
            if (study == null)
            {
                return BadRequest("Study not found");
            }

            var researcher = await _context.Users.FirstOrDefaultAsync(r => r.ID == request.ResearcherID && r.IsDeleted == false);
            if (researcher == null)
            {
                return BadRequest("Researcher not found");
            }

            int maxID = 900001;
            if (_context.StudyResearchers.Count() > 0)
            {
                maxID = await _context.StudyResearchers.MaxAsync(s => s.ID);

            }
            var newStudyResearcher = new StudyResearcher
            {
                ID = maxID + 1,
                DT = DateTime.Now,
                StudyID = request.StudyID,
                ResearcherID = request.ResearcherID,
                IsDeleted = false, 
                DltDT = null
            };
            _context.StudyResearchers.Add(newStudyResearcher);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("deletestudyresearcher/{srId}")]
        public async Task<IActionResult> DeleteStudyResearcher(int srId)
        {
            var studyresearcher = await _context.StudyResearchers.FirstOrDefaultAsync(sr => sr.ID == srId);

            if (studyresearcher == null)
            {
                return NotFound("Researcher doesn't take part in the study");
            }

            studyresearcher.IsDeleted = true;
            studyresearcher.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }

    }
}
