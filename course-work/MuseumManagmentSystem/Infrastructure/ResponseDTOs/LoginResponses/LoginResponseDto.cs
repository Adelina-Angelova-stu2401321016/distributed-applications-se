namespace MuseumManagmentSystem.Infrastructure.ResponseDTOs.LoginResponses
{
    public class LoginResponseDto
    {
        public int UserID { get; set; }
        public string Status { get; set; }     
        public string FName { get; set; }
        public int UserRoleId { get; set; }

        public string AccessToken { get; set; }
        public int ExpiresIn { get; set; }
    }
}
