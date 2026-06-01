using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MuseumManagmentSystem.Entities;
using MuseumManagmentSystem.Infrastructure.Data;
using MuseumManagmentSystem.Infrastructure.RequestDTOs.LoanRequests;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.LoanResponses;
using System.Data;

namespace MuseumManagmentSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LoanController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LoanController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("getloans")]
        public async Task<ActionResult<GetLoansDTO>> GetLoans([FromQuery] char? loanType, [FromQuery] DateTime? startDate,
   [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.Loans.Where(l => l.IsDeleted == false && l.Partner.IsDeleted == false);
            if (!(loanType is null))
            {
                query = query.Where(l => l.LoanType.Equals(loanType));
            }
            if (startDate.HasValue)
            {
                query = query.Where(l => l.StartDate.Date == startDate.Value.Date);
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
                    query = isDesc ? query.OrderByDescending(l => l.StartDate) : query.OrderBy(l => l.StartDate);
                }
                else
                {
                    query = isDesc ? query.OrderByDescending(l => l.EndDate) : query.OrderBy(l => l.EndDate);
                }
            }

            var loans = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(l => new GetLoansDTO
            {
                ID = l.ID,
                PartnerName = l.Partner.PartnerName, 
                LoanType = l.LoanType == 'o' ? "outgoing" : "incoming", 
                StartDate = l.StartDate, 
                EndDate = l.EndDate,
                Status = DateTime.Today < l.StartDate ? "future" : DateTime.Today > l.EndDate ? "finished" : "ongoing"
            })
            .ToListAsync();

            return Ok(loans);
        }

        [HttpGet("getloan/{loanId}")]
        public async Task<ActionResult<GetLoanDTO>> GetLoan(int loanId)
        {
            var loan = await _context.Loans.FirstOrDefaultAsync(l => l.ID == loanId); 
            return Ok(loan);
        }

        [HttpPost("addloan")]
        public async Task<ActionResult> AddLoan([FromBody] AddLoanDTO request)
        {
           
            var partner = await _context.Partners.FirstOrDefaultAsync(p => p.ID == request.PartnerID && p.IsDeleted == false);
            if (partner == null)
            {
                return BadRequest("Partner not found");
            }

            if(request.LoanType != 'O' && request.LoanType != 'I')
            {
                return BadRequest("Invalid loan type!"); 
            }
            if(request.EndDate < request.StartDate)
            {
                return BadRequest("End date cannot be bigger than start date");
            }

            int maxID = 140001;
            if (_context.Loans.Count() > 0)
            {
                maxID = await _context.Loans.MaxAsync(iav => iav.ID);
            }
            
            var newLoan = new Loan
            {
                ID = maxID + 1,
                DT = DateTime.Now,
                PartnerID = request.PartnerID,
                LoanType = request.LoanType,
                StartDate = request.StartDate, 
                EndDate = request.EndDate, 
                IsDeleted = false, 
                DltDT = null
            };
            _context.Loans.Add(newLoan);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("editloan")]
        public async Task<ActionResult> EditLoan([FromBody] UpdateLoanDTO request)
        {
            var partner = await _context.Partners.FirstOrDefaultAsync(p => p.ID == request.PartnerID && p.IsDeleted == false);
            if (partner == null)
            {
                return BadRequest("Partner not found");
            }
            if (request.EndDate < request.StartDate)
            {
                return BadRequest("End date cannot be bigger than start date");
            }


            if (request.LoanType != 'O' && request.LoanType != 'I')
            {
                return BadRequest("Invalid loan type!");
            }
            var loan = await _context.Loans.FirstOrDefaultAsync(l => l.ID == request.ID); 
            if(loan == null)
            {
                return NotFound("Loan not found"); 
            }

            loan.PartnerID = request.PartnerID;
            loan.LoanType = request.LoanType;
            loan.StartDate = request.StartDate;
            loan.EndDate = request.EndDate; 

            await _context.SaveChangesAsync();
            return Ok();

        }

        [HttpDelete("deleteloan/{loanId}")]
        public async Task<IActionResult> DeleteLoan(int loanId)
        {
            var loan = await _context.Loans.FirstOrDefaultAsync(l => l.ID == loanId);

            if (loan == null)
            {
                return NotFound("Loan not found");
            }

            loan.IsDeleted = true;
            loan.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }


    }
}
