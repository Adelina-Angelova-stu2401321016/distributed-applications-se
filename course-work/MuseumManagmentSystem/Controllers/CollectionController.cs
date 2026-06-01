using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MuseumManagmentSystem.Entities;
using MuseumManagmentSystem.Infrastructure.Data;
using MuseumManagmentSystem.Infrastructure.RequestDTOs.CollectionRequests;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.AttributeResponses;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.CollectionResponses;
using System.Data;

namespace MuseumManagmentSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CollectionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CollectionController(AppDbContext context)
        {
            _context = context;
        }

        
        [HttpGet("getcollections")]
        public async Task<ActionResult<GetCollectionsDTO>> GetCollections([FromQuery] string? collName, [FromQuery] DateTime? dtCreated,
            [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.Collections.Where(c => c.IsDeleted == false);
            if (!string.IsNullOrWhiteSpace(collName))
            {
                query = query.Where(c => c.CollName.Contains(collName));
            }
            if (dtCreated.HasValue)
            {
                query = query.Where(c => c.DT.Date == dtCreated.Value.Date);
            }
            if (pageNum < 1) return BadRequest("Page number cannot be less than 1.");
            if (pageSize < 1 || pageSize > 10000) return BadRequest("Page size should be number between 1 and 100");
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
                    query = isDesc ? query.OrderByDescending(a => a.CollName) : query.OrderBy(a => a.CollName);
                }
            }

            var collections = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(c => new GetCollectionsDTO
            {
                ID = c.ID,
                CollName = c.CollName
            })
        .ToListAsync();

            return Ok(collections);
        }

        
        [HttpPost("add-collection")]
        public async Task<ActionResult> AddCollection([FromBody] AddCollectionRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.CollName))
            {
                return BadRequest("The collection name is required");
            }

            int maxID = await _context.Collections.MaxAsync(c => c.ID);
            var newCollection = new Collection
            {
                ID = maxID + 1,
                DT = System.DateTime.Now,
                CollName = request.CollName,
                AdminID = int.Parse(User.FindFirst("userid")!.Value),
                IsDeleted = false,
                DltDT = null
            };

            _context.Collections.Add(newCollection);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("editcollection")]
        public async Task<ActionResult> EditCollection([FromBody] UpdateCollectionDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.CollName))
            {
                return BadRequest("Name is required.");
            }

            var collection = await _context.Collections.FirstOrDefaultAsync(c => c.ID == request.ID);
            if (collection == null)
            {
                return BadRequest("Collection not found");
            }

            collection.CollName = request.CollName;

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("deletecollection/{collectionId}")]
        public async Task<IActionResult> DeleteCollection(int collectionId)
        {
            var collection = await _context.Collections.FirstOrDefaultAsync(c => c.ID == collectionId);

            if (collection == null)
            {
                return NotFound("Collection not found");
            }

            collection.IsDeleted = true;
            collection.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
