using MuseumManagmentSystem.Entities;

namespace MuseumManagmentSystem.Infrastructure.ResponseDTOs.UserResponses
{
    public class GetAllUsersResponseDTO
    {
        public int ID { get; set; }
        public string Username { get; set; }
        public string FName { get; set; }
        public string LName { get; set; }
        public string UserRole { get; set; }
    }
}
