using MuseumManagmentSystem.Entities;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.UserRequests
{
    public class UpdateUserRequestDTO
    {
        public int ID { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string FName { get; set; }
        public string LName { get; set; }

        public int UserRoleID { get; set; }
    }
}
