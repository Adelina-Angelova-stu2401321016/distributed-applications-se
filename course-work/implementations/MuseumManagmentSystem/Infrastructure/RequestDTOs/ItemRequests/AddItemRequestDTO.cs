using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.ItemRequests
{
    public class AddItemRequestDTO
    {
        [Required]
        public string Item_Name { get; set; }
        public string? Description { get; set; }
        [Required]
        public int CollectionID { get; set; }
        public string? InternationalID { get; set; }
    }
}
