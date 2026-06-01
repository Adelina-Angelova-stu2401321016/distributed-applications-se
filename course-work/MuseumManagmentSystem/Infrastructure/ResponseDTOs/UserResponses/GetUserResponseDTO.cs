namespace MuseumManagmentSystem.Infrastructure.ResponseDTOs.UserResponses
{
    public class GetUserResponseDTO
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string FName { get; set; }
        public string LName { get; set; }

        public int UserRoleID { get; set; }
    }
}
