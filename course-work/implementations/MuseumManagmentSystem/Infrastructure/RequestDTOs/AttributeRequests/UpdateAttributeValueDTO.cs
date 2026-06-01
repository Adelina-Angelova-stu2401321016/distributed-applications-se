using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.AttributeRequests
{
    public class UpdateAttributeValueDTO
    {
        [Required]
        public int ID { get; set; }
        [Required]
        public string ValueName { get; set; }
    }
}
