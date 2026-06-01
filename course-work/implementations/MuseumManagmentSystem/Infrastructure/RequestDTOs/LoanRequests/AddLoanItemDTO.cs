using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.LoanRequests
{
    public class AddLoanItemDTO
    {
        [Required]
        public int LoanID { get; set; }
        [Required]
        public int ItemID { get; set; } 

    }
}
