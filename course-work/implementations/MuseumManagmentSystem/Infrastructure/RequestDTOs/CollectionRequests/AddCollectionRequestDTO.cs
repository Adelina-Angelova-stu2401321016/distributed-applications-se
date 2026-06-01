using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.CollectionRequests
{
    public class AddCollectionRequestDTO
    {
        [Required]
        public string CollName { get; set; }
    }
}
