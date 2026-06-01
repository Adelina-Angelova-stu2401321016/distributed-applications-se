using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
    public class LoanItemController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LoanItemController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("getloanitems/{loanID}")] 
        public async Task<ActionResult<GetLoanItemsDTO>> GetLoanItems(int loanID, [FromQuery] string? itemName, [FromQuery] DateTime? dtCreated,
   [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.LoanItems.Where(li => li.IsDeleted == false && li.LoanID == loanID && li.Item.IsDeleted == false && li.Item.Collection.IsDeleted == false && li.Loan.IsDeleted == false);
            if (!string.IsNullOrWhiteSpace(itemName))
            {
                query = query.Where(li => li.Item.ItemName.Contains(itemName));
            }
            if (dtCreated.HasValue)
            {
                query = query.Where(li => li.DT.Date == dtCreated.Value.Date);
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
                    query = isDesc ? query.OrderByDescending(li => li.Item.ItemName) : query.OrderBy(li => li.Item.ItemName);
                }
            }

            var loans = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(li => new GetLoanItemsDTO
            {
                ID = li.ID,
                ItemName = li.Item.ItemName
            }).ToListAsync();

            return Ok(loans); 
        }

        [HttpPost("addloanitem")]
        public async Task<ActionResult> AddLoanItem([FromBody] AddLoanItemDTO request)
        {

            var loan = await _context.Loans.FirstOrDefaultAsync(l => l.ID == request.LoanID && l.IsDeleted == false);
            if (loan == null)
            {
                return BadRequest("Loan not found");
            }

            var item = await _context.Items.FirstOrDefaultAsync(i => i.ID == request.ItemID && i.IsDeleted == false);
            if (item == null)
            {
                return BadRequest("Item not found");
            }

            int maxID = 140001;
            if (_context.LoanItems.Count() > 0)
            {
                maxID = await _context.LoanItems.MaxAsync(iav => iav.ID);
            }

            var newLoanItem = new LoanItem
            {
                ID = maxID + 1,
                DT = DateTime.Now,
                LoanID = request.LoanID,
                ItemID = request.ItemID, 
                IsDeleted = false, 
                DltDT = null
            };
            _context.LoanItems.Add(newLoanItem);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("deleteloanitem/{litemId}")]
        public async Task<IActionResult> DeleteLoanItem(int litemId)
        {
            var loanitem = await _context.LoanItems.FirstOrDefaultAsync(li => li.ID == litemId);

            if (loanitem == null)
            {
                return NotFound("Item doesn't belong to the loan");
            }

            loanitem.IsDeleted = true;
            loanitem.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }



    }
}
