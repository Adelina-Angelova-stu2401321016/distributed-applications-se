using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.PartnerRequests
{
    public class AddPartnerDTO
    {
        [Required]
        public string PartnerName { get; set; }
        [Required]
        public string VAT { get; set; }
        [Required]
        public int TypeID { get; set; }
    }
}
