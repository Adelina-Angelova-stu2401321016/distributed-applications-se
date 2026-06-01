using Azure.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
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
    public class StudyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudyController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("getstudies")]
        public async Task<ActionResult<GetStudiesDTO>> GetStudies([FromQuery] string? studyName, [FromQuery] DateTime? startDate,
   [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var userId = int.Parse(User.FindFirst("userid")!.Value);
            var roleId = int.Parse(User.FindFirst("roleid")!.Value);
            IQueryable<Study> query = _context.Studies.Where(s => s.IsDeleted == false);

            if (roleId != 100001)
            {
               query = query.Where(s => _context.StudyResearchers.Where(sr => sr.ResearcherID == userId).Select(sr => sr.StudyID).Contains(s.ID));
            }

            if (!string.IsNullOrWhiteSpace(studyName))
            {
                query = query.Where(s => s.StudyName.Contains(studyName));
            }
            if (startDate.HasValue)
            {
                query = query.Where(s => s.StartDate.Date == startDate.Value.Date);
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
                if (sortBy.Equals("startDate", StringComparison.OrdinalIgnoreCase))
                {
                    query = isDesc ? query.OrderByDescending(s => s.StartDate) : query.OrderBy(s => s.StartDate);
                }
                else
                {
                    query = isDesc ? query.OrderByDescending(s => s.StudyName) : query.OrderBy(s => s.StudyName);
                }
            }

            var studies = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(s => new GetStudiesDTO
            {
                ID = s.ID,
                StudyName = s.StudyName,
                Description = s.Description,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                Status = DateTime.Today < s.StartDate ? "future" : DateTime.Today > s.EndDate ? "finished" : "ongoing"
            })
            .ToListAsync();

            return Ok(studies);
        }

       
        
        [HttpGet("getstudy/{studyId}")]
        public async Task<ActionResult<GetStudyDTO>> GetStudy(int studyId)
        {
            var study = await _context.Studies.FirstOrDefaultAsync(s => s.ID == studyId);
            return Ok(study);
        }

        [Authorize]
        [HttpPost("addstudy")]
        public async Task<ActionResult> AddStudy([FromBody] AddStudyDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.StudyName))
            {
                return BadRequest("Study name is required"); 
            }
            if (string.IsNullOrWhiteSpace(request.Description))
            {
                return BadRequest("Description is required");
            }
            if(request.StartDate <= DateTime.MinValue)
            {
                return BadRequest("Wtf how did you even select that brat"); 
            }
            if (request.EndDate < request.StartDate)
            {
                return BadRequest("It can't end before it's begun babes.");
            }

            int maxID = 900001;
            if(_context.Studies.Count() > 0)
            {
                maxID = await _context.Studies.MaxAsync(s => s.ID);

            }
            int newID = maxID + 1; 
            var newStudy = new Study
            {
                ID = newID,
                DT = DateTime.Now,
                StudyName = request.StudyName,
                Description = request.Description,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                IsDeleted = false, 
                DltDT = null
            };
            _context.Studies.Add(newStudy);
            await _context.SaveChangesAsync();
            await AddFirstResearcher(newID); 
            return Ok();
        }

        public async Task<ActionResult> AddFirstResearcher(int studyId)
        {
            int maxID = 900001;
            if (_context.StudyResearchers.Count() > 0)
            {
                maxID = await _context.StudyResearchers.MaxAsync(s => s.ID);

            }
           

            var userId = User.FindFirst("userid")?.Value;
            int.TryParse(userId, out int researcherId); 
            var researcher = await _context.Users.FirstOrDefaultAsync(r => r.ID == researcherId && r.IsDeleted == false && r.UserRole.IsDeleted == false);
            if (researcher == null)
            {
                return NotFound("Researcher not found");
            }
            var newStudyResearcher = new StudyResearcher
            {
                ID = maxID + 1,
                DT = DateTime.Now,
                StudyID = studyId,
                ResearcherID = researcherId
            };
            _context.StudyResearchers.Add(newStudyResearcher);
            await _context.SaveChangesAsync();

            return Ok(); 
        }

        [HttpPost("editstudy")]
        public async Task<ActionResult> EditStudy([FromBody] UpdateStudyDTO request)
        {
            var study = await _context.Studies.FirstOrDefaultAsync(s => s.ID == request.ID && s.IsDeleted == false);
            if (study == null)
            {
                return BadRequest("Study not found");
            }
            if (string.IsNullOrWhiteSpace(request.StudyName))
            {
                return BadRequest("Study name is required");
            }
            if (string.IsNullOrWhiteSpace(request.Description))
            {
                return BadRequest("Description is required");
            }
            if (request.StartDate <= DateTime.MinValue)
            {
                return BadRequest("Wtf how did you even select that brat");
            }
            if (request.EndDate < request.StartDate)
            {
                return BadRequest("It can't end before it's begun babes.");
            }
            study.StudyName = request.StudyName;
            study.Description = request.Description;
            study.StartDate = request.StartDate;
            study.EndDate = request.EndDate;

            await _context.SaveChangesAsync();
            return Ok();

        }

        [HttpDelete("deletestudy/{studyId}")]
        public async Task<IActionResult> DeleteStudy(int studyId)
        {
            var study = await _context.Studies.FirstOrDefaultAsync(s => s.ID == studyId);

            if (study == null)
            {
                return NotFound("Study not found");
            }

            study.IsDeleted = true;
            study.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }


    }
}
