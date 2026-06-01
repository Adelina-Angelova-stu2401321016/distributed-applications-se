using MuseumManagmentSystem.Entities;
using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.FundRequests
{
    public class AddFundDTO
    {
        [Required]
        public int PartnerID { get; set; }
        [Required]
        public decimal Amount { get; set; }
        [Required]
        public string Currency { get; set; }
        [Required]
        public string Reason { get; set; }
        [Required]
        public int StudyID { get; set; }

    }
}
