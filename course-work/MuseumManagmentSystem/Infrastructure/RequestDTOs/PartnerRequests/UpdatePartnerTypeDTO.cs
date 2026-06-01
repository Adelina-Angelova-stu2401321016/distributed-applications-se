using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.PartnerRequests
{
    public class UpdatePartnerTypeDTO
    {
        [Required]
        public int ID { get; set; }
        [Required]
        public string TypeName { get; set; } 
    }
}
