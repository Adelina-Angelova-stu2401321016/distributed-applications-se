using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MuseumManagmentSystem.Entities;
using MuseumManagmentSystem.Infrastructure.Data;
using MuseumManagmentSystem.Infrastructure.RequestDTOs.ItemRequests;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.ItemResponses;
using System.Data;

namespace MuseumManagmentSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ItemController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ItemController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("getitems")]
        public async Task<ActionResult<GetItemsDTO>> GetItems([FromQuery] string? itemName, [FromQuery] string? interID,
        [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.Items.Where(i => i.IsDeleted == false && i.Collection.IsDeleted == false);
            if (!string.IsNullOrWhiteSpace(itemName))
            {
                query = query.Where(i => i.ItemName.Contains(itemName));
            }
            if (!string.IsNullOrWhiteSpace(interID))
            {
                query = query.Where(i => i.InternationalID.Contains(interID));
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
                if (sortBy.Equals("itemName", StringComparison.OrdinalIgnoreCase))
                {
                    query = isDesc ? query.OrderByDescending(i => i.ItemName) : query.OrderBy(i => i.ItemName);
                }
                else
                {
                    query = isDesc ? query.OrderByDescending(i => i.InternationalID) : query.OrderBy(i => i.InternationalID);
                }
            }
            


            var Items = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(i => new GetItemsDTO
            {
                ID = i.ID,
                Item_Name = i.ItemName, 
                Description = i.Description, 
                CollectionName = i.Collection.CollName, 
                InternationalID = i.InternationalID
            })
        .ToListAsync();

            return Ok(Items);
        }

        [HttpGet("getitem/{itemId}")]
        public async Task<ActionResult<GetItemDTO>> GetItem(int itemId)
        {
            var item = await _context.Items.FirstOrDefaultAsync(i => i.ID == itemId && i.IsDeleted == false);
            if (item == null)
            {
                return BadRequest("Item not found");
            }

            return Ok(item);

        }

        [HttpPost("additem")]
        public async Task<ActionResult> AddItem([FromBody] AddItemRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Item_Name))
            {
                return BadRequest("Name is required");
            }
           
            var collection = await _context.Collections.FirstOrDefaultAsync(c => c.ID == request.CollectionID && c.IsDeleted == false);
            if (collection == null)
            {
                return BadRequest("No such collection found in the db");
            }

            int maxID = await _context.Items.MaxAsync(i => i.ID);
            var newItem = new Item
            {
                ID = maxID + 1,
                DT = System.DateTime.Now,
                ItemName = request.Item_Name,
                Description = request.Description,
                CollectionID = request.CollectionID,
                InternationalID = request.InternationalID, 
                IsDeleted = false, 
                DltDT = null
            };

            _context.Items.Add(newItem);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("edititem")]
        public async Task<ActionResult> EditItem([FromBody] UpdateItemRequestDTO request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var collection = await _context.Collections.FirstOrDefaultAsync(c => c.ID == request.CollectionID && c.IsDeleted == false);
            if (collection == null)
            {
                return BadRequest("No such collection found in the db");
            }

            var item = await _context.Items.FirstOrDefaultAsync(i => i.ID == request.ID && i.IsDeleted == false);
            if (item == null)
            {
                return BadRequest("Item not found");
            }

            item.ItemName = request.Item_Name;
            item.Description = request.Description;
            item.CollectionID = request.CollectionID;
            item.InternationalID = request.InternationalID;

            await _context.SaveChangesAsync();
            return Ok();

        }

        [HttpDelete("deleteitem/{itemId}")]
        public async Task<IActionResult> DeleteItem(int itemId)
        {
            var item = await _context.Items.FirstOrDefaultAsync(i => i.ID == itemId);

            if (item == null)
            {
                return NotFound("Item not found");
            }

            item.IsDeleted = true;
            item.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }



    }
}
