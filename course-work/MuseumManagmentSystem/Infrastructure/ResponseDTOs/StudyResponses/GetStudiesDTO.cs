namespace MuseumManagmentSystem.Infrastructure.ResponseDTOs.StudyResponses
{
    public class GetStudiesDTO
    {
        public int ID { get; set; }
        public string StudyName { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } 
    }
}
