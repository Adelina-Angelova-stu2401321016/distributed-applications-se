using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MuseumManagmentSystem.Entities;
using MuseumManagmentSystem.Infrastructure.Data;
using MuseumManagmentSystem.Infrastructure.RequestDTOs.ExhibitRequests;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.ItemResponses;
using System.Data;

namespace MuseumManagmentSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ExhibitItemController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExhibitItemController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("get-exhibititems/{exhibitId}")]
        public async Task<ActionResult<GetItemsByExhDTO>> GetItemsByExhibit(int exhibitId, [FromQuery] string? itemName, [FromQuery] DateTime? dtCreated,
        [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.ExhibitItems.Where(ei => ei.IsDeleted == false && ei.ExhibitID == exhibitId && ei.Exhibit.IsDeleted == false && ei.Item.IsDeleted == false);
            if (!string.IsNullOrWhiteSpace(itemName))
            {
                query = query.Where(ei => ei.Item.ItemName.Contains(itemName));
            }
            if (dtCreated.HasValue)
            {
                query = query.Where(ei => ei.DT.Date == dtCreated.Value.Date);
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
                    query = isDesc ? query.OrderByDescending(ei => ei.DT) : query.OrderBy(ei => ei.DT);
                }
                else
                {
                    query = isDesc ? query.OrderByDescending(ei => ei.Item.ItemName) : query.OrderBy(ei => ei.Item.ItemName);
                }
            }


            var Items = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(ei => new GetItemsByExhDTO
            {
                ID = ei.ID,
                ItemID = ei.ItemID,
                Item_Name = ei.Item.ItemName
            })
        .ToListAsync();

            return Ok(Items);
        }

        [HttpGet("get-other-items/{exhibitId}")]
        public async Task<ActionResult<GetItemsNotExhDTO>> GetOtherItemsByExhibit(int exhibitId)
        {
            var Items = await _context.Items.Where(i => !_context.ExhibitItems.Any(ei => ei.ItemID == i.ID && ei.ExhibitID == exhibitId) && i.IsDeleted == false)
                .Select(i => new GetItemsNotExhDTO
                {
                    ItemID = i.ID,
                    Item_Name = i.ItemName
                })
        .ToListAsync();

            return Ok(Items);
        }

        [HttpPost("add-exhibititem")]
        public async Task<ActionResult> AddExhibitItem([FromBody] AddExhibitItemDTO request)
        {
            var exhibit = await _context.Exhibits.FirstOrDefaultAsync(e => e.ID == request.ExhibitID && e.IsDeleted == false);
            if (exhibit == null)
            {
                return BadRequest("No such exhibit in the db");
            }
            var item = await _context.Items.FirstOrDefaultAsync(i => i.ID == request.ItemID && i.IsDeleted == false);
            if (item == null)
            {
                return BadRequest("No such item in the db");
            }

            int maxID = 700001;
            if (_context.ExhibitItems.Count() > 0)
            {
                maxID = await _context.ExhibitItems.MaxAsync(er => er.ID);
            }
            var newExhibitItem = new ExhibitItem
            {
                ID = maxID + 1,
                DT = System.DateTime.Now,
                ExhibitID = request.ExhibitID,
                ItemID = request.ItemID, 
                IsDeleted = false, 
                DltDT = null
            };

            _context.ExhibitItems.Add(newExhibitItem);
            await _context.SaveChangesAsync();
            return Ok();

        }

        [HttpDelete("delete-exhibititem/{ehxitemId}")]
        public async Task<IActionResult> DeleteExhibitItem(int ehxitemId)
        {
            var exhibititem = await _context.ExhibitItems.FirstOrDefaultAsync(ei => ei.ID == ehxitemId);

            if (exhibititem == null)
            {
                return NotFound("Item doesn't belong to the exhibit");
            }

            exhibititem.IsDeleted = true;
            exhibititem.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }

    }
}
