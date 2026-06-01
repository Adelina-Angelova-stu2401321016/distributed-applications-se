namespace MuseumManagmentSystem.Infrastructure.ResponseDTOs
{
    public class ErrorResponseDTO
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
