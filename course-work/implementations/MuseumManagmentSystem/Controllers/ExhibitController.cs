using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MuseumManagmentSystem.Entities;
using MuseumManagmentSystem.Infrastructure.Data;
using MuseumManagmentSystem.Infrastructure.RequestDTOs.ExhibitRequests;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.ExhibitResponses;
using System.Security.Claims;

namespace MuseumManagmentSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ExhibitController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExhibitController(AppDbContext context)
        {
            _context = context;
        }

        
        [HttpGet("getexhibits")]
        public async Task<ActionResult<GetAllExhibitsResponseDTO>> GetAllExhibits([FromQuery] string? title, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate,
   [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var userId = int.Parse(User.FindFirst("userid")!.Value);
            var roleId = int.Parse(User.FindFirst("roleid")!.Value);
            IQueryable<Exhibit> query = _context.Exhibits.Where(e => e.IsDeleted == false);

            if (roleId != 100001)
            {
                query = query.Where(e => e.CuratorID == userId);
            }

            if (!string.IsNullOrWhiteSpace(title))
            {
                query = query.Where(e => e.Title.Contains(title));
            }
            if (startDate.HasValue)
            {
                query = query.Where(e => e.Start_Date.Date == startDate.Value.Date);
            }
            if (endDate.HasValue)
            {
                query = query.Where(e => e.End_Date.Date == endDate.Value.Date);
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
                if (sortBy.Equals("title", StringComparison.OrdinalIgnoreCase))
                {
                    query = isDesc ? query.OrderByDescending(e => e.Title) : query.OrderBy(e => e.Title);
                }
                else if (sortBy.Equals("startDate", StringComparison.OrdinalIgnoreCase))
                {
                    query = isDesc ? query.OrderByDescending(e => e.Start_Date) : query.OrderBy(e => e.Start_Date);
                }
                else
                {
                    query = isDesc ? query.OrderByDescending(e => e.End_Date) : query.OrderBy(e => e.End_Date);
                }
            }

            var AllExhibits = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(e => new GetAllExhibitsResponseDTO
            {
                ID = e.ID,
                Title = e.Title,
                Start_Date = e.Start_Date, 
                End_Date = e.End_Date, 
                Description = e.Description, 
                Entry_Price = e.Entry_Price,
                Curator = e.Curator.FName + " " + e.Curator.LName
            }).ToListAsync();

            return Ok(AllExhibits);
        }


        [HttpGet("getexhibit/{exhibitId}")]
        public async Task<ActionResult<GetExhibitDTO>> GetExhibit(int exhibitId)
        {
            var exhibit = await _context.Exhibits.FirstOrDefaultAsync(e => e.ID == exhibitId);
            if (exhibit == null)
            {
                return BadRequest("Exhibit not found");
            }
            return Ok(exhibit);
           
        }

        [HttpPost("addexhibit")]
        public async Task<ActionResult> AddExhibit([FromBody] AddExhibitRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest("Title is required");
            }
            if (string.IsNullOrWhiteSpace(request.Description))
            {
                return BadRequest("Description is required");
            }
            if (request.Start_Date == default)
            {
                return BadRequest("Start date is required.");
            }
            if (request.End_Date == default || request.End_Date < request.Start_Date)
            {
                return BadRequest("End date is required and cant be before the start date.");
            }
            if (request.Entry_Price < 0)
            {
                return BadRequest("Entry price is required.");
            }
            var curator = await _context.Users.FirstOrDefaultAsync(u => u.ID == request.CuratorID);
            if(curator == null)
            {
                return BadRequest("No such curator found in the db");
            }

            int maxID = await _context.Exhibits.MaxAsync(e => e.ID);
            var newExhibit = new Exhibit
            {
                ID = maxID +1,
                DT = System.DateTime.Now,
                Title = request.Title, 
                Start_Date = request.Start_Date, 
                End_Date = request.End_Date, 
                Description = request.Description, 
                Entry_Price = request.Entry_Price,
                CuratorID = request.CuratorID, 
                IsDeleted = false, 
                DltDT = null
            };

            _context.Exhibits.Add(newExhibit);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("editexhibit")]
        public async Task<ActionResult> EditExhibit([FromBody] UpdateExhibitRequestDTO request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (request.End_Date == default || request.End_Date < request.Start_Date)
            {
                return BadRequest("End date is required and cant be before the start date.");
            }
            var curator = await _context.Users.FirstOrDefaultAsync(u => u.ID == request.CuratorID);
            if (curator == null)
            {
                return BadRequest("No such curator found in the db");
            }

            var exhibit = await _context.Exhibits.FirstOrDefaultAsync(e => e.ID == request.ID); 
            if(exhibit == null)
            {
                return BadRequest("Exhibit not found"); 
            }

            exhibit.Title = request.Title;
            exhibit.Start_Date = request.Start_Date;
            exhibit.End_Date = request.End_Date;
            exhibit.Description = request.Description;
            exhibit.Entry_Price = request.Entry_Price;
            exhibit.CuratorID = request.CuratorID;

            await _context.SaveChangesAsync();
            return Ok(); 

        }

        
        [HttpDelete("delete-exhibit/{exhibitId}")]
        public async Task<IActionResult> DeleteExhibit(int exhibitId)
        {
            var exhibit = await _context.Exhibits.FirstOrDefaultAsync(e => e.ID == exhibitId);

            if (exhibit == null)
            {
                return NotFound("Exhibit not found");
            }

            exhibit.IsDeleted = true;
            exhibit.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }
       
    }
}
