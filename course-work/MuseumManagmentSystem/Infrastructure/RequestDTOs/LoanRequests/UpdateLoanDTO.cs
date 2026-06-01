using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.LoanRequests
{
    public class UpdateLoanDTO
    {
        [Required]
        public int ID { get; set; } 
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
