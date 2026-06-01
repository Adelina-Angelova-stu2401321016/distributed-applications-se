using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.StudyRequests
{
    public class AddStudyStudentDTO
    {
        [Required]
        public int StudyID { get; set; }
        [Required]
        public int StudentID { get; set; }

    }
}
