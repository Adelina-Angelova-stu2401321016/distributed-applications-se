using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.PartnerRequests
{
    public class AddPartnerTypeDTO
    {
        [Required]
        public string TypeName { get; set; } 
    }
}
