using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.ExhibitRequests
{
    public class AddExhibitRoomDTO
    {
        [Required]
        public int ExhibitID { get; set; }
        [Required]
        public int RoomID { get; set; }
    }
}
