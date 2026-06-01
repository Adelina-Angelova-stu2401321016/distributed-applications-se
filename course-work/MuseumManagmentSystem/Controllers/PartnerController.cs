using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MuseumManagmentSystem.Entities;
using MuseumManagmentSystem.Infrastructure.Data;
using MuseumManagmentSystem.Infrastructure.RequestDTOs.PartnerRequests;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.PartnerResponses;
using System.Data;

namespace MuseumManagmentSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PartnerController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PartnerController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("getpartnertypes")]
        public async Task<ActionResult<GetPartnerTypesDTO>> GetPartnerTypes([FromQuery] string? typeName, [FromQuery] DateTime? dtCreated,
   [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.PartnerTypes.Where(pt => pt.IsDeleted == false);

            if (!string.IsNullOrWhiteSpace(typeName))
            {
                query = query.Where(pt => pt.TypeName.Contains(typeName));
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
                    query = isDesc ? query.OrderByDescending(pt => pt.TypeName) : query.OrderBy(pt => pt.TypeName);
                }
            }

            var types = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(pt => new GetPartnerTypesDTO
            {
                ID = pt.ID,
                TypeName = pt.TypeName
            })
        .ToListAsync();

            return Ok(types);
        }

        [HttpGet("getpartners")]
        public async Task<ActionResult<GetPartnersDTO>> GetPartners([FromQuery] string? partnerName, [FromQuery] string? vat,
   [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {

            var query = _context.Partners.Where(p => p.IsDeleted == false && p.Type.IsDeleted == false);
            if (!string.IsNullOrWhiteSpace(partnerName))
            {
                query = query.Where(p => p.PartnerName.Contains(partnerName));
            }
            if (!string.IsNullOrWhiteSpace(vat))
            {
                query = query.Where(p => p.VAT.Contains(vat));
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
                    query = isDesc ? query.OrderByDescending(p => p.PartnerName) : query.OrderBy(p => p.PartnerName);
                }
                else
                {
                    query = isDesc ? query.OrderByDescending(p => p.VAT) : query.OrderBy(p => p.VAT);
                }
            }
            var partners = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(p => new GetPartnersDTO
            {
                ID = p.ID,
                PartnerName = p.PartnerName, 
                VAT = p.VAT, 
                TypeName = p.Type.TypeName
            })
        .ToListAsync();

            return Ok(partners);
        }

        [HttpGet("getpartner/{partnerId}")]
        public async Task<ActionResult<GetPartnerDTO>> GetPartner(int partnerId)
        {
            var partner = await _context.Partners.FirstOrDefaultAsync(p => p.ID == partnerId);
            return Ok(partner); 
        }


        [HttpPost("addpartner")]
        public async Task<ActionResult> AddPartner([FromBody] AddPartnerDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.PartnerName))
            {
                return BadRequest("Name is required"); 
            }
            if (string.IsNullOrWhiteSpace(request.VAT))
            {
                return BadRequest("VAT is required"); 
            }

            var ptype = await _context.PartnerTypes.FirstOrDefaultAsync(pt => pt.ID == request.TypeID && pt.IsDeleted == false); 
            if (ptype == null)
            {
                return BadRequest("Type not found"); 
            }

            int maxID = await _context.Partners.MaxAsync(pt => pt.ID);
            var newPartner = new Partner
            {
                ID = maxID + 1,
                DT = DateTime.Now,
                PartnerName = request.PartnerName,
                VAT = request.VAT,
                TypeID = request.TypeID, 
                IsDeleted = false, 
                DltDT = null
            };
            _context.Partners.Add(newPartner);
            await _context.SaveChangesAsync();
            return Ok(); 
        }

        [HttpPost("addpartnertype")]
        public async Task<ActionResult> AddPartnerType([FromBody] AddPartnerTypeDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.TypeName))
            {
                return BadRequest("Name is required");
            }

            int maxID = await _context.PartnerTypes.MaxAsync(pt => pt.ID);
            var newPartnerType = new PartnerType
            {
                ID = maxID + 1,
                DT = System.DateTime.Now,
                TypeName = request.TypeName, 
                IsDeleted = false, 
                DltDT= null
            };

            _context.PartnerTypes.Add(newPartnerType);
            await _context.SaveChangesAsync();
            return Ok();
        }
        [HttpPost("editpartner")]
        public async Task<ActionResult> EditPartner([FromBody] UpdatePartnerDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.PartnerName))
            {
                return BadRequest("Name is required");
            }
            if (string.IsNullOrWhiteSpace(request.VAT))
            {
                return BadRequest("VAT is required");
            }
            var ptype = await _context.PartnerTypes.FirstOrDefaultAsync(pt => pt.ID == request.TypeID && pt.IsDeleted == false);
            if (ptype == null)
            {
                return BadRequest("Type not found");
            }
            var partner = await _context.Partners.FirstOrDefaultAsync(p => p.ID == request.ID && p.IsDeleted == false);
            if (partner == null)
            {
                return BadRequest("Partner not found");
            }

            partner.PartnerName = request.PartnerName;
            partner.VAT = request.VAT;
            partner.TypeID = request.TypeID; 

            await _context.SaveChangesAsync();
            return Ok();

        }


        [HttpPost("editpartnertype")]
        public async Task<ActionResult> EditPartnerType([FromBody] UpdatePartnerTypeDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.TypeName))
            {
                return BadRequest("Name is required");
            }

            var ptype = await _context.PartnerTypes.FirstOrDefaultAsync(pt => pt.ID == request.ID && pt.IsDeleted == false);
            if (ptype == null)
            {
                return BadRequest("Type not found");
            }

            ptype.TypeName = request.TypeName;

            await _context.SaveChangesAsync();
            return Ok();

        }

        [HttpDelete("deletepartnertype/{typeId}")]
        public async Task<IActionResult> DeletePartnerType(int typeId)
        {
            var ptype = await _context.PartnerTypes.FirstOrDefaultAsync(pt => pt.ID == typeId);

            if (ptype == null)
            {
                return NotFound("Type not found");
            }

            ptype.IsDeleted = true;
            ptype.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("deletepartner/{partnerId}")]
        public async Task<ActionResult> DeletePartner(int partnerId)
        {
            var partner = await _context.Partners.FirstOrDefaultAsync(p => p.ID == partnerId); 
            if (partner == null)
            {
                return NotFound("Partner not found"); 
            }
            partner.IsDeleted = true;
            partner.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();
            return Ok(); 
        }

    }
}
