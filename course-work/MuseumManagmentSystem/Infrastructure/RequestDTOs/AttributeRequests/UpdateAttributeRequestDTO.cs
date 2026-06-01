using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.AttributeRequests
{
    public class UpdateAttributeRequestDTO
    {
        [Required]
        public int ID { get; set; }
        [Required]
        public string AttrName { get; set; } 
    }
}
