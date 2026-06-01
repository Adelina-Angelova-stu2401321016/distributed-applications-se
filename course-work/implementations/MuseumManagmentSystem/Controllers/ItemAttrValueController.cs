using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
    public class ItemAttrValueController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ItemAttrValueController(AppDbContext context)
        {
            _context = context;
        }


        [HttpGet("getitem-attrvalues/{itemId}")]
        public async Task<ActionResult<GetIAValuesDTO>> GetItemAttrValues(int itemId, [FromQuery] string? attrName, [FromQuery] string? valueName,
   [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.ItemAttrValues.Where(iav => iav.IsDeleted == false && iav.ItemID == itemId && iav.Item.IsDeleted == false && iav.Item.Collection.IsDeleted == false && iav.Value.IsDeleted == false && iav.Value.Attr.IsDeleted == false);
            if (!string.IsNullOrWhiteSpace(attrName))
            {
                query = query.Where(iav => iav.Value.Attr.AttrName.Contains(attrName));
            }
            if (!string.IsNullOrWhiteSpace(valueName))
            {
                query = query.Where(iav => iav.Value.ValueName.Contains(valueName));
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
                if (sortBy.Equals("attrName", StringComparison.OrdinalIgnoreCase))
                {
                    query = isDesc ? query.OrderByDescending(iav => iav.Value.Attr.AttrName) : query.OrderBy(iav => iav.Value.Attr.AttrName);
                }
                else
                {
                    query = isDesc ? query.OrderByDescending(iav => iav.Value.ValueName) : query.OrderBy(iav => iav.Value.ValueName);
                }
            }


            var values = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(iav => new GetIAValuesDTO
            {
                ID = iav.ID,
                AttrName = iav.Value.Attr.AttrName, 
                ValueName = iav.Value.ValueName
            })
        .ToListAsync();

            return Ok(values);
        }

        [HttpPost("additem-attrvalue")]
        public async Task<ActionResult> AddItemAttrValue([FromBody] AddItemAttrValueDTO request)
        {
            var item = await _context.Items.FirstOrDefaultAsync(i => i.ID == request.ItemID && i.IsDeleted == false && i.Collection.IsDeleted == false);
            if (item == null)
            {
                return BadRequest("Item not found");
            }
            var attrvalue = await _context.AttributeValues.FirstOrDefaultAsync(a => a.ID == request.AttrValueID && a.IsDeleted == false && a.Attr.IsDeleted == false);
            if (attrvalue == null)
            {
                return BadRequest("Attribute Value not found");
            }


            int maxID = 140001;
            if (_context.ItemAttrValues.Count() > 0)
            {
                maxID = await _context.ItemAttrValues.MaxAsync(iav => iav.ID);
            }

            var newItemAttrValue = new ItemAttrValue
            {
                ID = maxID + 1,
                DT = System.DateTime.Now,
                ItemID = request.ItemID,
                ValueID = request.AttrValueID, 
                IsDeleted = false, 
                DltDT = null
            };

            _context.ItemAttrValues.Add(newItemAttrValue);
            await _context.SaveChangesAsync();
            return Ok();
        }


        [HttpDelete("deleteitem-attrvalue/{iavId}")]
        public async Task<IActionResult> DeleteItemAttrValue(int iavId)
        {
            var iav = await _context.ItemAttrValues.FirstOrDefaultAsync(a => a.ID == iavId);

            if (iav == null)
            {
                return NotFound("This value does not belong to the item.");
            }

            iav.IsDeleted = true;
            iav.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }


    }
}
