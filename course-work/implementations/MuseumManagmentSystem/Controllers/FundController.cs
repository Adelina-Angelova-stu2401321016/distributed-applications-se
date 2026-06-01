using Azure.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using MuseumManagmentSystem.Entities;
using MuseumManagmentSystem.Infrastructure.Data;
using MuseumManagmentSystem.Infrastructure.RequestDTOs.FundRequests;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.FundResponses;
using System.Data;

namespace MuseumManagmentSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FundController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FundController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("getfunds")]
        public async Task<ActionResult<GetFundsDTO>> GetFunds([FromQuery] string? studyName, [FromQuery] decimal? amount,
   [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.Funds.Where(f => f.IsDeleted == false && f.Partner.IsDeleted == false && f.Study.IsDeleted == false);
            if (!string.IsNullOrWhiteSpace(studyName))
            {
                query = query.Where(f => f.Study.StudyName.Contains(studyName));
            }
            if (amount > 0)
            {
                query = query.Where(f => f.Amount == amount);
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
                if (sortBy.Equals("amount", StringComparison.OrdinalIgnoreCase))
                {
                    query = isDesc ? query.OrderByDescending(f => f.Amount) : query.OrderBy(f => f.Amount);
                }
                else
                {
                    query = isDesc ? query.OrderByDescending(f => f.Study.StudyName) : query.OrderBy(f => f.Study.StudyName);
                }
            }

            var funds = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(s => new GetFundsDTO
            {
                ID = s.ID, 
                DT = s.DT,
                PartnerName = s.Partner.PartnerName,
                Amount = s.Amount,
                Currency = s.Currency,
                Reason = s.Reason,
                StudyName = s.Study.StudyName
            }).ToListAsync();
            return Ok(funds);
        }


        [HttpGet("getfund/{fundId}")]
        public async Task<ActionResult<GetFundDTO>> GetFund(int fundId)
        {
            var fund = await _context.Funds.FirstOrDefaultAsync(s => s.ID == fundId);
            return Ok(fund);
        }

        [HttpPost("addfund")]
        public async Task<ActionResult> AddFund([FromBody] AddFundDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Currency))
            {
                return BadRequest("Currency is required");
            }
            if (string.IsNullOrWhiteSpace(request.Reason))
            {
                return BadRequest("Reason is required");
            }

            var partner = await _context.Partners.FirstOrDefaultAsync(p => p.ID == request.PartnerID && p.IsDeleted == false);
            if (partner == null)
            {
                return BadRequest("Partner not found");
            }

            var study = await _context.Studies.FirstOrDefaultAsync(s => s.ID == request.StudyID && s.IsDeleted == false);
            if (study == null)
            {
                return BadRequest("Study not found");
            }


            int maxID = 500001;
            if(_context.Funds.Count() > 0)
            {
                maxID = await _context.Funds.MaxAsync(f => f.ID);
            }
            var newFund = new Fund
            {
                ID = maxID + 1,
                DT = DateTime.Now,
                PartnerID = request.PartnerID,
                Amount = request.Amount,
                Currency = request.Currency,
                Reason = request.Reason, 
                StudyID = request.StudyID, 
                IsDeleted = false, 
                DltDT = null
            };
            _context.Funds.Add(newFund);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("editfund")]
        public async Task<ActionResult> EditFund([FromBody] UpdateFundDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Currency))
            {
                return BadRequest("Currency is required");
            }
            if (string.IsNullOrWhiteSpace(request.Reason))
            {
                return BadRequest("Reason is required");
            }

            var partner = await _context.Partners.FirstOrDefaultAsync(p => p.ID == request.PartnerID && p.IsDeleted == false);
            if (partner == null)
            {
                return BadRequest("Partner not found");
            }

            var study = await _context.Studies.FirstOrDefaultAsync(s => s.ID == request.StudyID && s.IsDeleted == false);
            if (study == null)
            {
                return BadRequest("Study not found");
            }

            var fund = await _context.Funds.FirstOrDefaultAsync(f => f.ID == request.ID && f.IsDeleted == false);
            if (fund == null)
            {
                return BadRequest("Fund not found");
            }
            
            fund.PartnerID = request.PartnerID;
            fund.Amount = request.Amount;
            fund.Currency = request.Currency;
            fund.Reason = request.Reason;
            fund.StudyID = request.StudyID; 

            await _context.SaveChangesAsync();
            return Ok();
        }


        [HttpDelete("deletefund/{fundId}")]
        public async Task<IActionResult> DeleteFund(int fundId)
        {
            var fund = await _context.Funds.FirstOrDefaultAsync(f => f.ID == fundId);

            if (fund == null)
            {
                return NotFound("Fund not found");
            }

            fund.IsDeleted = true;
            fund.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }


    }
}
