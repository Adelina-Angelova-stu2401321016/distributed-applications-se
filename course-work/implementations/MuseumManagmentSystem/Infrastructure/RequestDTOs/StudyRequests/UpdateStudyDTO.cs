using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.StudyRequests
{
    public class UpdateStudyDTO
    {
        [Required]
        public int ID { get; set; }
        [Required]
        public string StudyName { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
    }
}
