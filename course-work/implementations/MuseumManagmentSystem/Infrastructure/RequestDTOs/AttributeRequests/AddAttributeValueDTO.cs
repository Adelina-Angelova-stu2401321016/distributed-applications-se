using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.AttributeRequests
{
    public class AddAttributeValueDTO
    {
        [Required]
        public int AttrID { get; set; }
        [Required]
        public string ValueName { get; set; } 
    }
}
