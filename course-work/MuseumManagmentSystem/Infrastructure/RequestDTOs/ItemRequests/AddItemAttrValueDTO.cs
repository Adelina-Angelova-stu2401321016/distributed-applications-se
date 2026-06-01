using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.ItemRequests
{
    public class AddItemAttrValueDTO
    {
        [Required]
        public int ItemID { get; set; }
        [Required]
        public int AttrValueID { get; set; }
    }
}
