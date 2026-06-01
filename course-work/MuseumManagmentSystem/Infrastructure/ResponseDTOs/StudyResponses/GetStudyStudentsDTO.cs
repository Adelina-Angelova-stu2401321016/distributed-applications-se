using MuseumManagmentSystem.Entities;

namespace MuseumManagmentSystem.Infrastructure.ResponseDTOs.StudyResponses
{
    public class GetStudyStudentsDTO
    {
        public int ID { get; set; }
       
        public int StudentID { get; set; }
        public string FullName { get; set; } 
        public string PartnerName { get; set; } 

    }
}
