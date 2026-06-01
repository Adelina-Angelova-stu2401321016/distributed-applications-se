using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.CollectionRequests
{
    public class UpdateCollectionDTO
    {
        [Required]
        public int ID { get; set; }
        [Required]
        public string CollName { get; set; }
    }
}
