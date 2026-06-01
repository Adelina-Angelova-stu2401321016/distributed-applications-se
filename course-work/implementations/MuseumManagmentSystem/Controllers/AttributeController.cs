using Azure.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MuseumManagmentSystem.Entities;
using MuseumManagmentSystem.Infrastructure.Data;
using MuseumManagmentSystem.Infrastructure.RequestDTOs.AttributeRequests;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.AttributeResponses;
using System.Data;

namespace MuseumManagmentSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AttributeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AttributeController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("getattributes")]
        public async Task<ActionResult<GetAttributesDTO>> GetAttributes([FromQuery] string? attrName, [FromQuery] DateTime? dtCreated,
           [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.Attributes.Where(a => a.IsDeleted == false);
            if (!string.IsNullOrWhiteSpace(attrName))
            {
                query = query.Where(a => a.AttrName.Contains(attrName));
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
            else if(sortDirection == 1)
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
                    query = isDesc ? query.OrderByDescending(a => a.AttrName) : query.OrderBy(a => a.AttrName);
                }
            }

            var attributes = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(a => new GetAttributesDTO
            {
                 ID = a.ID,
                 AttrName = a.AttrName
            })
             .ToListAsync();

            return Ok(attributes);

        }

        [HttpGet("getattribute/{attrId}")]
        public async Task<ActionResult<GetAttributeDTO>> GetAttribute(int attrId)
        {
            var attribute = await _context.Attributes.FirstOrDefaultAsync(a => a.ID == attrId);
            if (attribute == null)
            {
                return BadRequest("Attribute not found");
            }
            return Ok(attribute);

        }

        [HttpGet("getattr-values/{attrId}")]
        public async Task<ActionResult<GetAttributeValuesDTO>> GetAttributeValues(int attrId, [FromQuery] string? attrValueName, [FromQuery] DateTime? dtCreated,
        [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.AttributeValues.Where(av => av.AttrID == attrId && av.IsDeleted == false && av.Attr.IsDeleted == false);
            if (!string.IsNullOrWhiteSpace(attrValueName))
            {
                query = query.Where(av => av.ValueName.Contains(attrValueName));
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
                    query = isDesc ? query.OrderByDescending(av => av.ValueName) : query.OrderBy(av => av.ValueName);
                }
            }


            var values = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(av => new GetAttributeValuesDTO
            {
                ID = av.ID,
                ValueName = av.ValueName
            }).ToListAsync();

            return Ok(values);
        }

        [HttpPost("addattribute")]
        public async Task<ActionResult> AddAttribute([FromBody] AddAttributeRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.AttrName))
            {
                return BadRequest("Name is required");
            }
            
            int maxID = await _context.Attributes.MaxAsync(e => e.ID);
            var newAttribute = new Entities.Attribute
            {
                ID = maxID + 1,
                DT = System.DateTime.Now,
                AttrName = request.AttrName, 
                AdminID = int.Parse(User.FindFirst("userid")!.Value),
                IsDeleted = false, 
                DltDT = null 
            };  

            _context.Attributes.Add(newAttribute);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("addattr-value")]
        public async Task<ActionResult> AddAttributeValue([FromBody] AddAttributeValueDTO request)
        {
            var attribute = await _context.Attributes.FirstOrDefaultAsync(a => a.ID == request.AttrID && a.IsDeleted == false);
            if (attribute == null)
            {
                return BadRequest("Attribute not found");
            }
            if (string.IsNullOrWhiteSpace(request.ValueName))
            {
                return BadRequest("Name is required");
            }

            int maxID = await _context.AttributeValues.MaxAsync(av => av.ID);
            var newAttributeValue = new AttributeValue
            {
                ID = maxID + 1,
                DT = System.DateTime.Now,
                AttrID = request.AttrID, 
                ValueName = request.ValueName, 
                IsDeleted = false, 
                DltDT = null
            };

            _context.AttributeValues.Add(newAttributeValue);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("editattribute")]
        public async Task<ActionResult> EditAttribute([FromBody] UpdateAttributeRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.AttrName))
            {
                return BadRequest("Name is required");
            }

            var attribute = await _context.Attributes.FirstOrDefaultAsync(a => a.ID == request.ID && a.IsDeleted == false);
            if (attribute == null)
            {
                return BadRequest("Attribute not found");
            }

            attribute.AttrName = request.AttrName;

            await _context.SaveChangesAsync();
            return Ok();

        }

        [HttpPost("editattr-value")]
        public async Task<ActionResult> EditAttributeValue([FromBody] UpdateAttributeValueDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.ValueName))
            {
                return BadRequest("Name is required.");
            }

            var attributevalue = await _context.AttributeValues.FirstOrDefaultAsync(av => av.ID == request.ID && av.IsDeleted == false);
            if (attributevalue == null)
            {
                return BadRequest("Attribute value not found");
            }

            attributevalue.ValueName = request.ValueName;

            await _context.SaveChangesAsync();
            return Ok();

        }

        [HttpDelete("delete-attribute/{attrId}")]
        public async Task<IActionResult> DeleteAttribute(int attrId)
        {
            var attribute = await _context.Attributes.FirstOrDefaultAsync(a => a.ID == attrId);

            if (attribute == null)
            {
                return NotFound("Attribute not found");
            }

            attribute.IsDeleted = true;
            attribute.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("delete-attr-value/{attrValueId}")]
        public async Task<IActionResult> DeleteAttributeValue(int attrValueId)
        {
            var attributevalue = await _context.AttributeValues.FirstOrDefaultAsync(av => av.ID == attrValueId);

            if (attributevalue == null)
            {
                return NotFound("Attribute value not found");
            }

            attributevalue.IsDeleted = true;
            attributevalue.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }


    }
}
