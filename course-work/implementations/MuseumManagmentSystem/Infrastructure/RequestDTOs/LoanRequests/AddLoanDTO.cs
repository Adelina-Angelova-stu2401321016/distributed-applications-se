using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.LoanRequests
{
    public class AddLoanDTO
    {
        [Required]
        public int PartnerID { get; set; }
        [Required]
        public char LoanType { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
    }
}
